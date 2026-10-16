import institutionRoutes from './institutionRoutes.js';
import userRoutes from './userRoutes.js';
import { Router } from "express";
import initializeRoutes from "./initializeRoutes.js";
import authRoutes from "./authRoutes.js";
import supportRoutes from "./supportRoutes.js";

const indexRoutes = Router();

indexRoutes.use('/institutions', institutionRoutes);
indexRoutes.use("/users", userRoutes);
indexRoutes.use("/support", supportRoutes);
indexRoutes.use("/initialize", initializeRoutes);
indexRoutes.use("/auth", authRoutes);

export default indexRoutes;s