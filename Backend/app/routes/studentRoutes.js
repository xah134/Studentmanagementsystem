import { Router } from 'express';
import { StudentController } from '../controllers/studentController.js';

const router = Router();

router.get('/', StudentController.list);
router.get('/:id', StudentController.getById);
router.post('/', StudentController.create);
router.patch('/:id', StudentController.update);
router.delete('/:id', StudentController.remove);

export default router;
