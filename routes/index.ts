import express from 'express';

import { employeeRouter } from './employee-route';
import { textReaderRouter } from './text-reader-routes'
import { userRouter } from './user-route';
import { authRouter } from './auth-route';

export const routes = express.Router();

routes.use('/api/employee', employeeRouter);
routes.use('/api/esales', textReaderRouter);
routes.use('/api/user', userRouter);
routes.use('/api/auth', authRouter);
