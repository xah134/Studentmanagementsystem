import { Router } from 'express';
import { InstitutionController } from '../controllers/institutionController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

router.get('/', requireAuth, InstitutionController.list);
router.post('/', InstitutionController.create);

export default router;