import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { AppError } from '../errors/AppError';

interface TokenPayload {
  sub: string;
  name: string;
  email: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        name: string;
        email: string;
      };
    }
  }
}

export function ensureAuthenticated(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token de autenticação ausente', 401);
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    throw new AppError('Token de autenticação mal formatado', 401);
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = verify(token, secret) as TokenPayload;

    req.user = {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
    };

    return next();
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }
}
