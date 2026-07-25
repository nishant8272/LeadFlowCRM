import { Router } from 'express';
import { NoteController } from '../controllers/note.controller';
import { auth } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { createNoteSchema } from '../validators/note.validator';

const router = Router({ mergeParams: true });
const controller = new NoteController();

router.use(auth);

// These will be mounted at /leads/:id/notes
router.get('/', controller.getNotesByLeadId);
router.post('/', validate(createNoteSchema), controller.createNote);

export default router;
