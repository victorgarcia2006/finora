import { Request } from "express";

interface JwtPayload {
  userId: string;
  email: string;
  empresa: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}