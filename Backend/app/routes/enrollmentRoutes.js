import { Router } from "express";
import { EnrollmentController } from "../controllers/enrollmentController.js";
import requireAuth from "../middleware/requireAuth.js";
import requireRole from "../middleware/requireRole.js";
import { Role } from "../types/user.js";

const router = Router();
const staff = [
  requireAuth,
  requireRole(Role.SYSTEM_ADMIN, Role.INSTITUTION_ADMIN, Role.SITE_ADMIN),
];

router.get("/", ...staff, EnrollmentController.list);
router.post("/", ...staff, EnrollmentController.create);
router.delete("/:id", ...staff, EnrollmentController.remove);

export default router;
