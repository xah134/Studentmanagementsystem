import { Router } from 'express';
import { InstitutionController } from '../controllers/institutionController.js';

const router = Router();

router.get('/', InstitutionController.list);
router.post('/', InstitutionController.create);

export default router;