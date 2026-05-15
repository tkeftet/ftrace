import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFloor extends Document {
  tenantId: Types.ObjectId;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FloorSchema = new Schema<IFloor>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

FloorSchema.index({ tenantId: 1, order: 1 });

export default mongoose.model<IFloor>('Floor', FloorSchema);
