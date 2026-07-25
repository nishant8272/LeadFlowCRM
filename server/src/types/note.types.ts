import { Document, Model, Types } from 'mongoose';

export interface INote {
  leadId: Types.ObjectId;
  userId: Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface INoteDocument extends INote, Document {}

export interface INoteModel extends Model<INoteDocument> {}
