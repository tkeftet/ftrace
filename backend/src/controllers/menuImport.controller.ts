import { Response, NextFunction } from 'express';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> = require('pdf-parse');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require('mammoth') as {
  extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }>;
};
import OpenAI from 'openai';
import { AuthRequest } from '../types';
import MenuCategory from '../models/MenuCategory';
import MenuItem from '../models/MenuItem';

/* ── Groq client — free tier, supports text + vision ── */
let _groq: OpenAI | null = null;
function getGroq(): OpenAI {
  if (!_groq) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY is not set in environment variables');
    _groq = new OpenAI({ apiKey: key, baseURL: 'https://api.groq.com/openai/v1' });
  }
  return _groq;
}

const TEXT_MODEL = 'llama-3.3-70b-versatile'; // best free text model on Groq
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'; // free vision model on Groq

const JSON_OBJECT_SCHEMA = `{
  "categories": [
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
}`;

const JSON_ARRAY_SCHEMA = `[
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
]`;

const RULES = `Rules:
- "target" must be "bar" for any beverage, drink, cocktail, coffee, wine, beer, juice, or alcohol; "kitchen" for all food.
- "price" must be a number (e.g. 12.5). Use 0 if the price is not listed.
- Do not include unavailable or out-of-stock items.`;

function extractCategoriesFromAIResponse(raw: string): unknown[] {
  // Strip markdown code fences if present
  const clean = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(clean);
  } catch {
    // Try to find a JSON block within the text
    const arrStart = clean.indexOf('[');
    const arrEnd = clean.lastIndexOf(']');
    const objStart = clean.indexOf('{');
    const objEnd = clean.lastIndexOf('}');

    if (arrStart !== -1 && arrEnd > arrStart) {
      try {
        parsed = JSON.parse(clean.slice(arrStart, arrEnd + 1));
      } catch {
        /* fall through */
      }
    }
    if (!parsed && objStart !== -1 && objEnd > objStart) {
      try {
        parsed = JSON.parse(clean.slice(objStart, objEnd + 1));
      } catch {
        /* fall through */
      }
    }
    if (!parsed) throw new Error('No valid JSON found in AI response');
  }

  if (Array.isArray(parsed)) return parsed;

  // JSON object mode wraps array: { categories: [...] } or similar
  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    const arr =
      obj.categories ??
      obj.menu ??
      obj.items ??
      obj.data ??
      Object.values(obj).find((v) => Array.isArray(v));
    if (Array.isArray(arr)) return arr;
  }

  throw new Error('Unexpected AI response shape — could not locate categories array');
}

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/menu/import/parse
   Body: multipart/form-data — field "menu" = PDF, image, or Word file
   Returns extracted categories + items for user review before confirming
──────────────────────────────────────────────────────────────────────────*/
export async function parseMenu(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded. Send the file in the "menu" field.' });
      return;
    }

    const mime = file.mimetype;

    /* ── Image: send to vision model ─────────────────────────── */
    if (mime.startsWith('image/')) {
      const b64 = file.buffer.toString('base64');
      const dataUrl = `data:${mime};base64,${b64}`;

      const completion = await getGroq().chat.completions.create({
        model: VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: dataUrl } },
              {
                type: 'text',
                text: `You are a menu parser. Extract every category and item visible in this menu image.\n\nReturn ONLY a valid JSON array — no markdown, no explanation:\n${JSON_ARRAY_SCHEMA}\n\n${RULES}`,
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      });

      const raw = completion.choices[0]?.message?.content ?? '';
      let extracted: unknown[];
      try {
        extracted = extractCategoriesFromAIResponse(raw);
      } catch {
        res.status(422).json({
          error: 'AI could not parse the menu image. Try a higher-resolution or clearer image.',
          raw: raw.slice(0, 500),
        });
        return;
      }

      res.json({ categories: extracted });
      return;
    }

    /* ── Text extraction: PDF or DOCX ───────────────────────── */
    let rawText = '';

    if (mime === 'application/pdf') {
      const parsed = await pdfParse(file.buffer);
      rawText = parsed.text.trim();
      if (!rawText) {
        res.status(422).json({
          error:
            'No text found in this PDF — it may be a scanned image. Upload a JPG/PNG of the menu instead.',
        });
        return;
      }
    } else if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      rawText = result.value.trim();
      if (!rawText) {
        res.status(422).json({ error: 'Could not extract text from the Word document.' });
        return;
      }
    } else {
      res.status(400).json({
        error:
          'Unsupported file type. Upload a PDF, Word document (.docx), or image (JPG, PNG, WebP).',
      });
      return;
    }

    // Limit to 15 000 chars to stay within token budget
    const truncated = rawText.slice(0, 15000);

    // Use JSON object mode for guaranteed valid JSON output
    const completion = await getGroq().chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a menu parser. You extract structured data from restaurant menus and return only valid JSON.',
        },
        {
          role: 'user',
          content: `Extract every category and item from this menu text.\n\nReturn a JSON object with this exact structure:\n${JSON_OBJECT_SCHEMA}\n\n${RULES}\n\nMenu text:\n---\n${truncated}\n---`,
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    let extracted: unknown[];
    try {
      extracted = extractCategoriesFromAIResponse(raw);
    } catch {
      res.status(422).json({
        error: 'AI could not return valid JSON. Try a cleaner document.',
        raw: raw.slice(0, 500),
      });
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
    const reusedCategories: string[] = [];
    const createdItems: string[] = [];

    for (const cat of categories) {
      if (!cat.categoryName?.trim()) continue;

      // Find by name regardless of isActive — avoids duplicate-key errors
      // from inactive categories that still occupy the unique index slot
      let category = await MenuCategory.findOne({
        tenantId,
        name: { $regex: `^${cat.categoryName.trim()}$`, $options: 'i' },
      });

      if (!category) {
        const count = await MenuCategory.countDocuments({ tenantId });
        try {
          category = await MenuCategory.create({
            tenantId,
            name: cat.categoryName.trim(),
            displayOrder: count,
            isActive: true,
          });
          createdCategories.push(category.name);
        } catch (err: unknown) {
          // Duplicate key: another request created it just now — fetch it
          if ((err as { code?: number }).code === 11000) {
            const existing = await MenuCategory.findOne({
              tenantId,
              name: { $regex: `^${cat.categoryName.trim()}$`, $options: 'i' },
            });
            if (!existing) throw err;
            category = existing;
            reusedCategories.push(category.name);
          } else {
            throw err;
          }
        }
      } else {
        reusedCategories.push(category.name);
      }

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
      reusedCategories,
      createdItems,
    });
  } catch (err) {
    next(err);
  }
}
