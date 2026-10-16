import institutionRoutes from './institutionRoutes.js';
import userRoutes from './userRoutes.js';
import { Router } from "express";
import initializeRoutes from "./initializeRoutes.js";
import authRoutes from "./authRoutes.js";

const indexRoutes = Router();

indexRoutes.use('/institutions', institutionRoutes);
indexRoutes.use("/users", userRoutes);
indexRoutes.use("/initialize", initializeRoutes);
indexRoutes.use("/auth", authRoutes);

export default indexRoutes;
