import { Document, Model, Types } from 'mongoose';

export type ActivityAction =
  | 'Lead Created'
  | 'Status Changed'
  | 'Assigned User'
  | 'Note Added'
  | 'Lead Updated'
  | 'Lead Deleted';

export interface IActivity {
  leadId: Types.ObjectId;
  userId: Types.ObjectId;
  action: ActivityAction;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

export interface IActivityDocument extends IActivity, Document {}

export interface IActivityModel extends Model<IActivityDocument> {}
