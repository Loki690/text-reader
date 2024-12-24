"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const axios_1 = __importDefault(require("axios"));
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUri = process.env.AUTH_URI;
    try {
        const response = yield axios_1.default.post(`${authUri}/login`, {
            usr: req.body.usr,
            pwd: req.body.pwd
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    }
    catch (error) {
        res.status(500).send("Error logging in");
    }
});
exports.login = login;
