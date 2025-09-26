import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/user/userController';

const userRoutes = Router();

// POST /api/users/register - Register a new user
userRoutes.post('/register', registerUser);

// POST /api/users/login - Login user
userRoutes.post('/login', loginUser);

export default userRoutes;