import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  tenantId: Types.ObjectId;
  targetRole: string; // 'serveur' | 'barman' | 'cuisine' | 'admin'
  message: string;
  orderId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    targetRole: { type: String, required: true },
    message: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ tenantId: 1, targetRole: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
