import { Response, NextFunction } from 'express';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> = require('pdf-parse');
import OpenAI from 'openai';
import { AuthRequest } from '../types';
import MenuCategory from '../models/MenuCategory';
import MenuItem from '../models/MenuItem';

/* ── Groq client (free tier, OpenAI-compatible) ── */
let _groq: OpenAI | null = null;
function getGroq(): OpenAI {
  if (!_groq) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY is not set in environment variables');
    _groq = new OpenAI({
      apiKey: key,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return _groq;
}

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/menu/import/parse
   Body: multipart/form-data — field "menu" = PDF file
   Returns an array of extracted categories with their items for user review
──────────────────────────────────────────────────────────────────────────*/
export async function parsePdfMenu(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No PDF file uploaded. Send the file in the "menu" field.' });
      return;
    }
    if (file.mimetype !== 'application/pdf') {
      res.status(400).json({ error: 'Only PDF files are accepted.' });
      return;
    }

    // Extract raw text from the PDF buffer
    const parsed = await pdfParse(file.buffer);
    const rawText = parsed.text.trim();
    if (!rawText) {
      res.status(422).json({ error: 'Could not extract any text from the PDF.' });
      return;
    }

    // Limit input to first 12 000 chars to stay within token budget
    const truncated = rawText.slice(0, 12000);

    const prompt = `You are a menu parser. Extract all menu categories and their items from the following restaurant menu text.

Return ONLY a valid JSON array (no markdown, no explanation) matching this exact structure:
[
  {
    "categoryName": "string",
    "items": [
      {
        "name": "string",
        "description": "string or empty string",
        "price": number,
        "target": "kitchen" or "bar"
      }
    ]
  }
]

Rules:
- "target" must be "bar" for beverages/drinks/cocktails/coffee, "kitchen" for everything else.
- "price" must be a number (e.g. 12.5). Use 0 if the price is not found.
- Do not include inactive or unavailable items.
- Do not add any commentary outside the JSON array.

Menu text:
---
${truncated}
---`;

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content ?? '';

    // Strip markdown code fences if the model wrapped the JSON
    const clean = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let extracted: unknown;
    try {
      extracted = JSON.parse(clean);
    } catch {
      res.status(422).json({
        error: 'AI could not return valid JSON. Try a cleaner PDF.',
        raw: clean.slice(0, 500),
      });
      return;
    }

    if (!Array.isArray(extracted)) {
      res.status(422).json({ error: 'Unexpected AI response shape.', raw: clean.slice(0, 500) });
      return;
    }

    res.json({ categories: extracted });
  } catch (err) {
    next(err);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/menu/import/confirm
   Body: { categories: [{ categoryName, items: [{ name, description, price, target }] }] }
   Creates the categories (reuses existing by name) and their items in bulk.
──────────────────────────────────────────────────────────────────────────*/
export interface ImportItemPayload {
  name: string;
  description?: string;
  price: number;
  target: 'bar' | 'kitchen';
}
export interface ImportCategoryPayload {
  categoryName: string;
  items: ImportItemPayload[];
}

export async function confirmImport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.user!.tenantId;
    const { categories } = req.body as { categories: ImportCategoryPayload[] };

    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(400).json({ error: 'categories array is required' });
      return;
    }

    const createdCategories: string[] = [];
    const createdItems: string[] = [];

    for (const cat of categories) {
      if (!cat.categoryName?.trim()) continue;

      // Find or create the category
      let category = await MenuCategory.findOne({
        tenantId,
        name: { $regex: `^${cat.categoryName.trim()}$`, $options: 'i' },
        isActive: true,
      });

      if (!category) {
        const count = await MenuCategory.countDocuments({ tenantId, isActive: true });
        category = await MenuCategory.create({
          tenantId,
          name: cat.categoryName.trim(),
          displayOrder: count,
          isActive: true,
        });
        createdCategories.push(category.name);
      }

      // Insert items — skip duplicates (same name + category)
      for (const item of cat.items ?? []) {
        if (!item.name?.trim()) continue;
        const exists = await MenuItem.exists({
          tenantId,
          category: category._id,
          name: item.name.trim(),
        });
        if (exists) continue;

        await MenuItem.create({
          tenantId,
          category: category._id,
          name: item.name.trim(),
          description: item.description?.trim() || undefined,
          price: typeof item.price === 'number' ? item.price : 0,
          target: item.target === 'bar' ? 'bar' : 'kitchen',
          isAvailable: true,
        });
        createdItems.push(item.name.trim());
      }
    }

    res.status(201).json({
      message: `Import complete: ${createdCategories.length} new categories, ${createdItems.length} new items added.`,
      createdCategories,
      createdItems,
    });
  } catch (err) {
    next(err);
  }
}
