import { Router } from "express";
import { SupportController } from "../controllers/supportController.js";
import requireAuth from "../middleware/requireAuth.js";
import requireRole from "../middleware/requireRole.js";
import { Role } from "../types/user.js";

const supportRoutes = Router();
const staff = [
  requireAuth,
  requireRole(Role.SYSTEM_ADMIN, Role.INSTITUTION_ADMIN, Role.SITE_ADMIN),
];

supportRoutes.post("/whatsapp/webhook", SupportController.webhook);
supportRoutes.post("/whatsapp/sessions", ...staff, SupportController.startSession);
supportRoutes.get("/whatsapp/sessions/:siteId/qr", ...staff, SupportController.qr);
supportRoutes.get("/tickets", ...staff, SupportController.list);
supportRoutes.get("/tickets/:id", ...staff, SupportController.open);
supportRoutes.patch("/tickets/:id", ...staff, SupportController.updateStatus);
supportRoutes.post("/tickets/:id/messages", ...staff, SupportController.reply);

export default supportRoutes;
