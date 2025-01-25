import { Router } from 'express';
import { getUser, createUser, updateUser, deleteUser } from '../controller/user.controller';

export const userRouter = Router();

userRouter.get('/:id', getUser);
userRouter.post('/create', createUser);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);
