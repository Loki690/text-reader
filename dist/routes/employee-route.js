"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeRouter = void 0;
const express_1 = require("express");
exports.employeeRouter = (0, express_1.Router)();
const employees = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Doe' },
    { id: 3, name: 'John Smith' },
];
exports.employeeRouter.get('/getEmployees', (req, res) => {
    res.status(200).json(employees);
});
exports.employeeRouter.get("/sample", (req, res) => {
    res.send("Express + TypeScript Server");
});
exports.employeeRouter.get('/getEmployee/:id', (req, res) => {
    const employee = employees.find(e => e.id === parseInt(req.params.id));
    if (!employee)
        res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(employee);
});
