import { Router } from "express";
import { TimetableController } from "../controllers/timetableController.js";
import requireAuth from "../middleware/requireAuth.js";
import requireRole from "../middleware/requireRole.js";
import { Role } from "../types/user.js";

const router = Router();
const staff = [
  requireAuth,
  requireRole(Role.SYSTEM_ADMIN, Role.INSTITUTION_ADMIN, Role.SITE_ADMIN),
];

router.patch("/:id", ...staff, TimetableController.update);
router.delete("/:id", ...staff, TimetableController.remove);

export default router;
