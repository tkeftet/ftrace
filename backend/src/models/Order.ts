import mongoose, { Schema, Document, Types } from 'mongoose';
import { OrderStatus, OrderItemTarget } from '../types';

export interface IOrderItem {
  _id?: Types.ObjectId;
  menuItem: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  target: OrderItemTarget;
  isReady: boolean;
  notes?: string;
  roundNumber: number;
}

export interface IRoundEntry {
  roundNumber: number;
  status: OrderStatus;
  createdAt: Date;
}

export interface IStatusHistoryEntry {
  status: OrderStatus;
  changedBy?: Types.ObjectId; // null = client self-order
  changedAt: Date;
}

export interface IOrder extends Document {
  rounds: IRoundEntry[];
  tenantId: Types.ObjectId;
  table: Types.ObjectId;
  sessionId?: string; // ties the order to a table session (customer QR-flow)
  nonce?: string; // client-generated idempotency key for duplicate-order prevention
  items: IOrderItem[];
  status: OrderStatus;
  statusHistory: IStatusHistoryEntry[];
  totalAmount: number;
  customerName?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    target: { type: String, enum: ['bar', 'kitchen'], required: true },
    isReady: { type: Boolean, default: false },
    notes: { type: String },
    roundNumber: { type: Number, default: 1 },
  },
  { _id: true }
);

const RoundEntrySchema = new Schema<IRoundEntry>(
  {
    roundNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'],
      default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'],
      required: true,
    },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    table: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    items: { type: [OrderItemSchema], required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'],
      default: 'pending',
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    sessionId: { type: String, index: true },
    nonce: { type: String },
    totalAmount: { type: Number, required: true, min: 0 },
    customerName: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rounds: { type: [RoundEntrySchema], default: [] },
  },
  { timestamps: true }
);

OrderSchema.index({ tenantId: 1, status: 1 });
OrderSchema.index({ tenantId: 1, table: 1 });
// Unique nonce per session — prevents duplicate submissions from client retries
OrderSchema.index({ sessionId: 1, nonce: 1 }, { unique: true, sparse: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
