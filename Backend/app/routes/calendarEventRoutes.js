import { Router } from "express";
import { CalendarEventController } from "../controllers/calendarEventController.js";
import requireAuth from "../middleware/requireAuth.js";
import requireRole from "../middleware/requireRole.js";
import { Role } from "../types/user.js";

const router = Router();
const staff = [
  requireAuth,
  requireRole(Role.SYSTEM_ADMIN, Role.INSTITUTION_ADMIN, Role.SITE_ADMIN),
];

router.get("/", ...staff, CalendarEventController.list);
router.post("/", ...staff, CalendarEventController.create);
router.patch("/:id", ...staff, CalendarEventController.update);
router.delete("/:id", ...staff, CalendarEventController.remove);

export default router;
