import { Router } from "express";
import AuthController from "../controllers/authController.js";

const authRoutes = Router();

authRoutes.post("/signup", AuthController.signUp);
authRoutes.post("/signin", AuthController.signIn);
authRoutes.post("/reset-password", AuthController.resetPassword);
authRoutes.post("/update-password", AuthController.updatePassword);
authRoutes.post("/signout", AuthController.signOut);

export default authRoutes;