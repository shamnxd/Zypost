import { Schema, model, Document, Types } from 'mongoose';

export interface IDomain extends Document {
  userId: Types.ObjectId | string;
  domain: string;
  verificationToken: string;
  verified: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const DomainSchema = new Schema<IDomain>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true, unique: true },
  verificationToken: { type: String, required: true },
  verified: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const DomainModel = model<IDomain>('Domain', DomainSchema);
