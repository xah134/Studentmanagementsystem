import { Router } from 'express';
import { CourseController } from '../controllers/courseController.js';
import { TimetableController } from '../controllers/timetableController.js';
import requireAuth from '../middleware/requireAuth.js';
import requireRole from '../middleware/requireRole.js';
import { Role } from '../types/user.js';

const router = Router();
const staff = [
  requireAuth,
  requireRole(Role.SYSTEM_ADMIN, Role.INSTITUTION_ADMIN, Role.SITE_ADMIN),
];

router.get('/', CourseController.list);
router.get('/:id/timetable', ...staff, TimetableController.listByCourse);
router.post('/:id/timetable', ...staff, TimetableController.create);
router.get('/:id', CourseController.getById);
router.post('/', CourseController.create);
router.patch('/:id', CourseController.update);
router.delete('/:id', CourseController.remove);

export default router;
