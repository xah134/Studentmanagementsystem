import { Router } from "express";
import InitializeController from "../controllers/initializeController.js";

const initializeRoutes = Router();

initializeRoutes.get("/", InitializeController.checkUserExists);

initializeRoutes.post("/", InitializeController.createUser);
export default initializeRoutes;