import { Router } from 'express';
import { InstitutionController } from '../controllers/institutionController.js';
import requireAuth from '../middleware/requireAuth.js';
import requireRole from '../middleware/requireRole.js';
import { Role } from '../types/user.js';

const router = Router();

router.get('/', requireAuth, requireRole(Role.SYSTEM_ADMIN), InstitutionController.list);
router.post('/', InstitutionController.create);
router.patch('/:id', InstitutionController.update);

export default router;