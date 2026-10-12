import { Router } from "express";
import initializeRoutes from "./initializeRoutes.js";
import authRoutes from "./authRoutes.js";
const indexRoutes = Router();

indexRoutes.use("/initialize", initializeRoutes);
indexRoutes.use("/auth", authRoutes);

export default indexRoutes;