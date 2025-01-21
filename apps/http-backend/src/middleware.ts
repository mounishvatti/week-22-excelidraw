import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

interface CustomRequest extends Request {
    userId?: string;
}

export function middleware(req: CustomRequest, res: Response, next: NextFunction) {
    const token = req.headers["authorization"] ?? "";

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded) {
        req.userId = (decoded as jwt.JwtPayload).userId;
        next();
    } else {
        res.status(403).json({
            message: "Unauthorized"
        })
    }
}