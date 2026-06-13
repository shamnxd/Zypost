import { Schema, model, Document, Types } from 'mongoose';

export interface IMailbox extends Document {
  userId: Types.ObjectId | string;
  domainId: Types.ObjectId | string;
  email: string;
  password: string; // Plaintext or hashed mailbox password
  status: 'active' | 'suspended';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const MailboxSchema = new Schema<IMailbox>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  domainId: { type: Schema.Types.ObjectId, ref: 'Domain', required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
}, {
  timestamps: true
});

export const MailboxModel = model<IMailbox>('Mailbox', MailboxSchema);
