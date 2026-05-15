import mongoose, { Schema, Document, Types } from 'mongoose';
import { OrderItemTarget } from '../types';

export interface IMenuItem extends Document {
  tenantId: Types.ObjectId;
  category: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  image?: string;
  target: OrderItemTarget; // 'bar' or 'kitchen'
  isAvailable: boolean;
  preparationTime?: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    target: { type: String, enum: ['bar', 'kitchen'], required: true },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number },
  },
  { timestamps: true }
);

MenuItemSchema.index({ tenantId: 1, category: 1 });

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
