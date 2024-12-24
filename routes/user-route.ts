import { Router } from 'express';
import { getUser, createUser, updateUser, deleteUser } from '../controller/user.controller';

export const userRouter = Router();

userRouter.get('/user/:id', getUser);
userRouter.post('/user', createUser);
userRouter.put('/user/:id', updateUser);
userRouter.delete('/user/:id', deleteUser);
