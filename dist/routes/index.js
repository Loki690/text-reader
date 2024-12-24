"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = __importDefault(require("express"));
const employee_route_1 = require("./employee-route");
const text_reader_routes_1 = require("./text-reader-routes");
const user_route_1 = require("./user-route");
const auth_route_1 = require("./auth-route");
exports.routes = express_1.default.Router();
exports.routes.use('/api/employee', employee_route_1.employeeRouter);
exports.routes.use('/api/esales', text_reader_routes_1.textReaderRouter);
exports.routes.use('/api/user', user_route_1.userRouter);
exports.routes.use('/api/auth', auth_route_1.authRouter);
