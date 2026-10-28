import { Router } from 'express';
import { ModuleController } from '../controllers/moduleController.js';

const router = Router();

router.get('/', ModuleController.list);
router.get('/:id', ModuleController.getById);
router.post('/', ModuleController.create);
router.patch('/:id', ModuleController.update);
router.delete('/:id', ModuleController.remove);

export default router;
