import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMenuCategory extends Document {
  tenantId: Types.ObjectId;
  name: string;
  displayOrder: number;
  isActive: boolean;
}

const MenuCategorySchema = new Schema<IMenuCategory>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MenuCategorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default mongoose.model<IMenuCategory>('MenuCategory', MenuCategorySchema);
