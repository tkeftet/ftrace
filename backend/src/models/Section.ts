import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISection extends Document {
  tenantId: Types.ObjectId;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema<ISection>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SectionSchema.index({ tenantId: 1, order: 1 });

export default mongoose.model<ISection>('Section', SectionSchema);
