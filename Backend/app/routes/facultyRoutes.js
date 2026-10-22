import { Router } from 'express';
import { FacultyController } from '../controllers/facultyController.js';

const router = Router();

router.get('/', FacultyController.list);
router.get('/:id', FacultyController.getById);
router.post('/', FacultyController.create);
router.patch('/:id', FacultyController.update);
router.delete('/:id', FacultyController.remove);

export default router;
