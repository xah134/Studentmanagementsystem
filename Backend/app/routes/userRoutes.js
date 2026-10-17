import { Router } from 'express';
import { UserController } from '../controllers/userController.js';

const userRoutes = Router();

userRoutes.get('/', UserController.list);
userRoutes.post('/', UserController.create);

export default userRoutes;
