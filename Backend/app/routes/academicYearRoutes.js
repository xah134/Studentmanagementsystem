import { Router } from "express";
import { AcademicYearController } from "../controllers/academicYearController.js";
import requireAuth from "../middleware/requireAuth.js";
import requireRole from "../middleware/requireRole.js";
import { Role } from "../types/user.js";

const router = Router();
const staff = [
  requireAuth,
  requireRole(Role.SYSTEM_ADMIN, Role.INSTITUTION_ADMIN, Role.SITE_ADMIN),
];

router.get("/", ...staff, AcademicYearController.list);
router.post("/", ...staff, AcademicYearController.create);
router.patch("/:id", ...staff, AcademicYearController.update);
router.delete("/:id", ...staff, AcademicYearController.remove);

export default router;
