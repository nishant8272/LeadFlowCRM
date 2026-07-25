import { Request, Response, NextFunction } from 'express';
import { NoteService } from '../services/note.service';
import { LeadService } from '../services/lead.service';
import { CustomError } from '../utils/CustomError';

export class NoteController {
  private noteService: NoteService;
  private leadService: LeadService;

  constructor() {
    this.noteService = new NoteService();
    this.leadService = new LeadService();
  }

  getNotesByLeadId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError('Unauthorized', 401);
      }
      const { id } = req.params;

      // Verify user has access to the lead first
      await this.leadService.getLeadById(id, req.user.userId, req.user.role);

      const notes = await this.noteService.getNotesByLeadId(id);
      res.status(200).json({
        success: true,
        data: notes,
      });
    } catch (error) {
      next(error);
    }
  };

  createNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new CustomError('Unauthorized', 401);
      }
      const { id } = req.params;
      const { message } = req.body;

      // Verify user has access to write notes to the lead
      await this.leadService.getLeadById(id, req.user.userId, req.user.role);

      const note = await this.noteService.createNote(id, req.user.userId, message);
      res.status(201).json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  };
}
