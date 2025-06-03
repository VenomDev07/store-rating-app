import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: number; // user id
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Request {
  user: {
    name: string;
    id: number;
    email: string;
    role: Role;
  };
}