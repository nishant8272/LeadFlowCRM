import { Lead } from '../models/lead.model';
import { ILeadDocument } from '../types/lead.types';

interface FindAllParams {
  filter: {
    status?: string;
    priority?: string;
    assignedTo?: string | null;
    createdBy?: string;
    date?: string;
  };
  search?: string;
  sort: { [key: string]: any };
  page: number;
  limit: number;
}

export class LeadRepository {
  async create(leadData: Partial<ILeadDocument>): Promise<ILeadDocument> {
    const lead = new Lead(leadData);
    return await lead.save();
  }

  async findById(id: string): Promise<ILeadDocument | null> {
    return await Lead.findById(id).populate('assignedTo', 'name email role').populate('createdBy', 'name email role');
  }

  async findAll(params: FindAllParams): Promise<{ leads: ILeadDocument[]; total: number }> {
    const { filter, search, sort, page, limit } = params;
    const query: any = {};

    // Apply filters
    if (filter.status) {
      query.status = filter.status;
    }
    if (filter.priority) {
      query.priority = filter.priority;
    }
    if (filter.assignedTo !== undefined) {
      query.assignedTo = filter.assignedTo;
    }
    if (filter.createdBy !== undefined) {
      query.createdBy = filter.createdBy;
    }

    // Date range filter: expect ISO string or simple relative date
    if (filter.date) {
      const dateVal = new Date(filter.date);
      if (!isNaN(dateVal.getTime())) {
        query.createdAt = { $gte: dateVal };
      }
    }

    // Apply Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    return { leads, total };
  }

  async update(id: string, updateData: Partial<ILeadDocument>): Promise<ILeadDocument | null> {
    return await Lead.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');
  }

  async delete(id: string): Promise<ILeadDocument | null> {
    return await Lead.findByIdAndDelete(id);
  }
}
