import { Activity } from '../models/activity.model';
import { IActivityDocument } from '../types/activity.types';

export class ActivityRepository {
  async create(activityData: Partial<IActivityDocument>): Promise<IActivityDocument> {
    const activity = new Activity(activityData);
    const saved = await activity.save();
    return await saved.populate('userId', 'name email');
  }

  async findByLeadId(leadId: string): Promise<IActivityDocument[]> {
    return await Activity.find({ leadId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
  }
}
