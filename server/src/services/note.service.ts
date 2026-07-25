import { NoteRepository } from '../repositories/note.repository';
import { ActivityService } from './activity.service';
import { INoteDocument } from '../types/note.types';
import { Types } from 'mongoose';

export class NoteService {
  private noteRepository: NoteRepository;
  private activityService: ActivityService;

  constructor() {
    this.noteRepository = new NoteRepository();
    this.activityService = new ActivityService();
  }

  async createNote(leadId: string, userId: string, message: string): Promise<INoteDocument> {
    const note = await this.noteRepository.create({
      leadId: new Types.ObjectId(leadId),
      userId: new Types.ObjectId(userId),
      message,
    });

    // Log the "Note Added" activity
    await this.activityService.createActivity(
      leadId,
      userId,
      'Note Added',
      '',
      message.length > 30 ? message.substring(0, 27) + '...' : message
    );

    return note;
  }

  async getNotesByLeadId(leadId: string): Promise<INoteDocument[]> {
    return await this.noteRepository.findByLeadId(leadId);
  }
}
