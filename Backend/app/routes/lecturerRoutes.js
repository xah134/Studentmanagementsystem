import { Router } from 'express';
import { LecturerController } from '../controllers/lecturerController.js';

const router = Router();

router.get('/', LecturerController.list);
router.get('/:id', LecturerController.getById);
router.post('/', LecturerController.create);
router.patch('/:id', LecturerController.update);
router.delete('/:id', LecturerController.remove);

export default router;
