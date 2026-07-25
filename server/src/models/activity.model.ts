import { Schema, model } from 'mongoose';
import { IActivityDocument, IActivityModel } from '../types/activity.types';

const activitySchema = new Schema<IActivityDocument>(
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
    action: {
      type: String,
      required: true,
      enum: ['Lead Created', 'Status Changed', 'Assigned User', 'Note Added', 'Lead Updated', 'Lead Deleted'],
    },
    oldValue: {
      type: String,
      default: '',
    },
    newValue: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Activity = model<IActivityDocument, IActivityModel>('Activity', activitySchema);
