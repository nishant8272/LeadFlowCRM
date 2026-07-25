import { Note } from '../models/note.model';
import { INoteDocument } from '../types/note.types';

export class NoteRepository {
  async create(noteData: Partial<INoteDocument>): Promise<INoteDocument> {
    const note = new Note(noteData);
    const saved = await note.save();
    return await saved.populate('userId', 'name email avatar');
  }

  async findByLeadId(leadId: string): Promise<INoteDocument[]> {
    return await Note.find({ leadId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email avatar');
  }
}
