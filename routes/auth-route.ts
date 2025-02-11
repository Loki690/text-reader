import { Router, Request, Response } from 'express';
import { login } from '../controller/auth.controller';

export const authRouter = Router();
authRouter.post('/login', login);
