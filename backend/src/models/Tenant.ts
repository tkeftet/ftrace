import mongoose, { Schema, Document, Types } from 'mongoose';
import { TenantPlan } from '../types';

export interface ITenant extends Document {
  name: string;
  slug: string; // subdomain identifier – unique
  plan: TenantPlan;
  owner: Types.ObjectId;
  logo?: string;
  currency: string;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'],
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'enterprise'],
      default: 'free',
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    logo: { type: String },
    currency: { type: String, default: 'MAD' },
    timezone: { type: String, default: 'Africa/Casablanca' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITenant>('Tenant', TenantSchema);
