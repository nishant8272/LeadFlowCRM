import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';
import { LeadService } from '../services/lead.service';
import { CustomError } from '../utils/CustomError';

export class ActivityController {
  private activityService: ActivityService;
  private leadService: LeadService;

  constructor() {
    this.activityService = new ActivityService();
    this.leadService = new LeadService();
  }

  getActivitiesByLeadId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError('Unauthorized', 401);
      }
      const { id } = req.params;

      // Verify access to the lead
      await this.leadService.getLeadById(id, req.user.userId, req.user.role);

      const activities = await this.activityService.getActivitiesByLeadId(id);
      res.status(200).json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  };
}
