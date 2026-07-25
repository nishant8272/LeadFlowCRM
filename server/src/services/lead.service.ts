import { LeadRepository } from '../repositories/lead.repository';
import { UserRepository } from '../repositories/user.repository';
import { ActivityService } from './activity.service';
import { ILeadDocument, LeadStatus, LeadPriority } from '../types/lead.types';
import { CustomError } from '../utils/CustomError';
import { Types } from 'mongoose';

export class LeadService {
  private leadRepository: LeadRepository;
  private userRepository: UserRepository;
  private activityService: ActivityService;

  constructor() {
    this.leadRepository = new LeadRepository();
    this.userRepository = new UserRepository();
    this.activityService = new ActivityService();
  }

  async createLead(leadData: Partial<ILeadDocument>, userId: string): Promise<ILeadDocument> {
    const data = {
      ...leadData,
      createdBy: new Types.ObjectId(userId),
      status: leadData.status || 'NEW',
      priority: leadData.priority || 'MEDIUM',
    };

    const newLead = await this.leadRepository.create(data);

    // Log activity
    await this.activityService.createActivity(newLead.id, userId, 'Lead Created');

    return newLead;
  }

  async getLeadById(id: string, userId: string, userRole: string): Promise<ILeadDocument> {
    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new CustomError('Lead not found', 404);
    }

    // Role check: MEMBER can only view assigned leads or leads they created
    if (userRole === 'MEMBER') {
      const isAssigned = lead.assignedTo && lead.assignedTo._id.toString() === userId;
      const isCreator = lead.createdBy && lead.createdBy._id.toString() === userId;
      if (!isAssigned && !isCreator) {
        throw new CustomError('Access denied to this lead', 403);
      }
    }

    return lead;
  }

  async getLeads(
    queryOptions: {
      status?: string;
      priority?: string;
      assignedTo?: string | null;
      date?: string;
      search?: string;
      sortBy?: string;
      page?: number;
      limit?: number;
    },
    userId: string,
    userRole: string
  ): Promise<{ leads: ILeadDocument[]; total: number }> {
    const page = Math.max(1, Number(queryOptions.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(queryOptions.limit) || 10));

    // Construct filter params
    const filter: any = {};

    if (queryOptions.status) {
      filter.status = queryOptions.status;
    }
    if (queryOptions.priority) {
      filter.priority = queryOptions.priority;
    }

    // Role check
    if (userRole === 'MEMBER') {
      // Member can only see leads assigned to them
      filter.assignedTo = new Types.ObjectId(userId);
    } else {
      if (queryOptions.assignedTo !== undefined) {
        if (
          queryOptions.assignedTo === 'null' ||
          queryOptions.assignedTo === '' ||
          queryOptions.assignedTo === null
        ) {
          filter.assignedTo = null;
        } else {
          filter.assignedTo = new Types.ObjectId(queryOptions.assignedTo);
        }
      }
    }

    if (queryOptions.date) {
      filter.date = queryOptions.date;
    }

    // Construct sorting params
    const sort: any = {};
    if (queryOptions.sortBy) {
      const parts = queryOptions.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort
    }

    return await this.leadRepository.findAll({
      filter,
      search: queryOptions.search,
      sort,
      page,
      limit,
    });
  }

  async updateLead(
    id: string,
    updateData: Partial<ILeadDocument>,
    userId: string,
    userRole: string
  ): Promise<ILeadDocument> {
    const oldLead = await this.leadRepository.findById(id);
    if (!oldLead) {
      throw new CustomError('Lead not found', 404);
    }

    // Authorization checks
    if (userRole === 'MEMBER') {
      const isAssigned = oldLead.assignedTo && oldLead.assignedTo._id.toString() === userId;
      const isCreator = oldLead.createdBy && oldLead.createdBy._id.toString() === userId;
      if (!isAssigned && !isCreator) {
        throw new CustomError('Access denied to update this lead', 403);
      }
      // Members cannot re-assign leads
      if (updateData.assignedTo !== undefined) {
        throw new CustomError('Members are not allowed to assign leads', 403);
      }
    }

    const updated = await this.leadRepository.update(id, updateData);
    if (!updated) {
      throw new CustomError('Failed to update lead', 500);
    }

    // Automated activity logs checking what changed
    // 1. Status check
    if (updateData.status && updateData.status !== oldLead.status) {
      await this.activityService.createActivity(
        id,
        userId,
        'Status Changed',
        oldLead.status,
        updateData.status
      );
    }

    // 2. Assignment check
    if (updateData.assignedTo !== undefined) {
      const oldAssignedId = oldLead.assignedTo ? oldLead.assignedTo._id.toString() : '';
      const newAssignedId = updateData.assignedTo ? updateData.assignedTo.toString() : '';

      if (oldAssignedId !== newAssignedId) {
        let oldName = 'Unassigned';
        let newName = 'Unassigned';

        if (oldAssignedId) {
          const oldUser = await this.userRepository.findById(oldAssignedId);
          if (oldUser) oldName = oldUser.name;
        }

        if (newAssignedId) {
          const newUser = await this.userRepository.findById(newAssignedId);
          if (newUser) newName = newUser.name;
        }

        await this.activityService.createActivity(
          id,
          userId,
          'Assigned User',
          oldName,
          newName
        );
      }
    }

    // 3. Other updates fallback
    const hasStatusOrAssign = updateData.status !== undefined || updateData.assignedTo !== undefined;
    const hasOtherChanges = Object.keys(updateData).some(
      (key) => key !== 'status' && key !== 'assignedTo' && (updateData as any)[key] !== (oldLead as any)[key]
    );

    if (hasOtherChanges && !hasStatusOrAssign) {
      await this.activityService.createActivity(id, userId, 'Lead Updated');
    }

    return updated;
  }

  async deleteLead(id: string, userId: string, userRole: string): Promise<void> {
    if (userRole !== 'ADMIN') {
      throw new CustomError('Only admins can delete leads', 403);
    }

    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new CustomError('Lead not found', 404);
    }

    await this.leadRepository.delete(id);

    // Optionally log a delete activity or just complete
    // Since lead is deleted, related timeline notes will be orphaned or can be deleted,
    // let's leave them or clean them. Deleting is sufficient.
  }
}
