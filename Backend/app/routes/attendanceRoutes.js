import { Router } from "express";
import { AttendanceController } from "../controllers/attendanceController.js";
import requireAuth from "../middleware/requireAuth.js";
import requireRole from "../middleware/requireRole.js";
import { Role } from "../types/user.js";

const router = Router();
const staff = [
  requireAuth,
  requireRole(Role.SYSTEM_ADMIN, Role.INSTITUTION_ADMIN, Role.SITE_ADMIN),
];

router.get("/", ...staff, AttendanceController.getRoster);
router.put("/", ...staff, AttendanceController.bulkUpsert);

export default router;
