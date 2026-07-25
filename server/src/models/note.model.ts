import { Schema, model } from 'mongoose';
import { INoteDocument, INoteModel } from '../types/note.types';

const noteSchema = new Schema<INoteDocument>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Note message is required'],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Note = model<INoteDocument, INoteModel>('Note', noteSchema);
