import mongoose, { Schema, Document, Types } from 'mongoose';

export type TableSessionStatus = 'active' | 'closed' | 'expired';

export interface ITableSession extends Document {
  tenantId: Types.ObjectId;
  tableId: Types.ObjectId;
  sessionId: string; // crypto UUID v4
  status: TableSessionStatus;
  expiresAt: Date;
  closedBy?: Types.ObjectId; // staff userId who closed the bill
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TableSessionSchema = new Schema<ITableSession>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    sessionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['active', 'closed', 'expired'],
      default: 'active',
    },
    expiresAt: { type: Date, required: true },
    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

// Fast lookup by sessionId (used by session middleware on every order request)
TableSessionSchema.index({ sessionId: 1 }, { unique: true });

// Find the active session for a table (used on QR scan and close-session)
TableSessionSchema.index({ tenantId: 1, tableId: 1, status: 1 });

// Auto-cleanup: MongoDB removes the document 24 h after expiresAt (data retention)
// This does NOT affect active sessions — they are checked by middleware logic.
TableSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86_400 });

export default mongoose.model<ITableSession>('TableSession', TableSessionSchema);
