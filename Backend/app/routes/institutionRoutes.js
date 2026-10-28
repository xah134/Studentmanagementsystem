import { Router } from 'express';
import multer from 'multer';
import { InstitutionController } from '../controllers/institutionController.js';
import requireAuth from '../middleware/requireAuth.js';
import requireRole from '../middleware/requireRole.js';
import { Role } from '../types/user.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', requireAuth, requireRole(Role.SYSTEM_ADMIN), InstitutionController.list);
router.post('/', upload.single('logo'), InstitutionController.create);
router.patch('/:id', upload.single('logo'), InstitutionController.update);
router.post('/:id/logo', upload.single('logo'), InstitutionController.uploadLogo);

export default router;
