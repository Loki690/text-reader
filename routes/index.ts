import express from 'express';

import { employeeRouter } from './employee-route';
import { textReaderRouter } from './text-reader-routes'

export const routes = express.Router();

routes.use('/api/employee', employeeRouter);
routes.use('/api/esales', textReaderRouter);
