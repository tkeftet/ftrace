import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITable extends Document {
  tenantId: Types.ObjectId;
  floorId: Types.ObjectId;
  sectionId?: Types.ObjectId;
  number: number;
  label?: string; // e.g. "Terrace 3"
  capacity: number;
  qrCode: string; // URL-encoded QR payload
  isOccupied: boolean;
  assignedTo?: Types.ObjectId; // serveur userId
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    floorId: { type: Schema.Types.ObjectId, ref: 'Floor', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', default: null },
    number: { type: Number, required: true },
    label: { type: String, trim: true },
    capacity: { type: Number, default: 4 },
    qrCode: { type: String },
    isOccupied: { type: Boolean, default: false },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

TableSchema.index({ tenantId: 1, number: 1 }, { unique: true });

export default mongoose.model<ITable>('Table', TableSchema);
