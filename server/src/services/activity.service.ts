import { ActivityRepository } from '../repositories/activity.repository';
import { IActivityDocument, ActivityAction } from '../types/activity.types';
import { Types } from 'mongoose';

export class ActivityService {
  private activityRepository: ActivityRepository;

  constructor() {
    this.activityRepository = new ActivityRepository();
  }

  async createActivity(
    leadId: string,
    userId: string,
    action: ActivityAction,
    oldValue?: string,
    newValue?: string
  ): Promise<IActivityDocument> {
    return await this.activityRepository.create({
      leadId: new Types.ObjectId(leadId),
      userId: new Types.ObjectId(userId),
      action,
      oldValue,
      newValue,
    });
  }

  async getActivitiesByLeadId(leadId: string): Promise<IActivityDocument[]> {
    return await this.activityRepository.findByLeadId(leadId);
  }
}
