import { Request, Response } from 'express';
import axios from 'axios';

interface LoginResponse {
    token: string;
    message?: string;
    [key: string]: any;
}

export const login = async (req: Request, res: Response) => {

    const authUri = process.env.AUTH_URI;

    try {
        const response = await axios.post(`${authUri}/login`, {
            usr: req.body.usr,
            pwd: req.body.pwd
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        return response.data;
    } catch (error) {
        res.status(500).send("Error logging in");
    }
};
