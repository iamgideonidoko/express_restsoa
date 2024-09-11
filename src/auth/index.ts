import type { Request } from 'express';
import createHttpError from 'http-errors';
import { container } from '@/ioc';
import { AuthService } from '@/domains/auth/auth.service';

export const expressAuthentication = async (request: Request, securityName: string) => {
  if (securityName === 'cookieAuth') {
    const token = request.cookies.token as string | undefined;
    if (!token) throw createHttpError.Unauthorized('No token');
    const authService = container.get(AuthService);
    // ! Validate the token here
    const payload = await authService.verifyJwt({ type: 'token', secret: token });
    if (!payload) throw createHttpError.Unauthorized('Invalid token');
    // ! Return user info
    return {
      id: payload.id,
    };
  }
  throw createHttpError.InternalServerError('Authentication method not supported');
};
