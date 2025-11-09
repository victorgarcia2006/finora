
type JwtPayload = {
  userId: string;
  email: string;
};

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
    }
  }
}