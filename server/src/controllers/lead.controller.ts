import { Request, Response, NextFunction } from 'express';
import { LeadService } from '../services/lead.service';
import { CustomError } from '../utils/CustomError';
import { User } from '../models/user.model';

export class LeadController {
  private leadService: LeadService;

  constructor() {
    this.leadService = new LeadService();
  }

  createPublicLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Find the first ADMIN user to assign as the creator of this public lead
      const firstAdmin = await User.findOne({ role: 'ADMIN' });
      if (!firstAdmin) {
        throw new CustomError('System admin not found. Public submission is temporarily disabled.', 503);
      }
      const leadData = {
        ...req.body,
        source: req.body.source || 'Public Intake Form',
      };
      const lead = await this.leadService.createLead(leadData, firstAdmin.id);
      res.status(201).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  };

  createLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError('Unauthorized', 401);
      }
      const lead = await this.leadService.createLead(req.body, req.user.userId);
      res.status(201).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  };

  getLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError('Unauthorized', 401);
      }

      const { status, priority, assignedTo, date, search, sortBy, page, limit } = req.query;

      const { leads, total } = await this.leadService.getLeads(
        {
          status: status as string,
          priority: priority as string,
          assignedTo: assignedTo as string,
          date: date as string,
          search: search as string,
          sortBy: sortBy as string,
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
        },
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        success: true,
        data: leads,
        pagination: {
          page: Math.max(1, parseInt(page as string) || 1),
          limit: Math.max(1, parseInt(limit as string) || 10),
          total,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getLeadById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError('Unauthorized', 401);
      }
      const { id } = req.params;
      const lead = await this.leadService.getLeadById(id, req.user.userId, req.user.role);
      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  };

  updateLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError('Unauthorized', 401);
      }
      const { id } = req.params;
      const lead = await this.leadService.updateLead(id, req.body, req.user.userId, req.user.role);
      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError('Unauthorized', 401);
      }
      const { id } = req.params;
      await this.leadService.deleteLead(id, req.user.userId, req.user.role);
      res.status(200).json({
        success: true,
        message: 'Lead deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError('Unauthorized', 401);
      }
      const { id } = req.params;
      const { status } = req.body;
      const lead = await this.leadService.updateLead(id, { status }, req.user.userId, req.user.role);
      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  };

  assignLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError('Unauthorized', 401);
      }
      const { id } = req.params;
      const { assignedTo } = req.body;
      const lead = await this.leadService.updateLead(id, { assignedTo }, req.user.userId, req.user.role);
      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  };
}
