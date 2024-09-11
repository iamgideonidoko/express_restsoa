import { injectable, inject } from 'inversify';
import { TYPES } from '@/ioc/types';
import type { Logger } from 'winston';
import bcrypt from 'bcryptjs';
import type { JwtAddedPayload, NewUser } from './auth.interface';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import appConfig from '@/config';
import { AuthRepository } from './auth.repo';
import createHttpError from 'http-errors';
import type { Response as ExpressResponse } from 'express';
import ms from 'ms';

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(AuthRepository) private readonly authRepository: AuthRepository,
  ) {}

  private async generateSalt(): Promise<string> {
    const saltRounds = 10;
    return new Promise<string>((resolve, reject) => {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) reject(err);
        resolve(salt);
      });
    });
  }

  private hashPassword(password: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const salt = await this.generateSalt();
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) reject(err);
          resolve(hash);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public async validatePassword(userPassword: string, dbPassword: string): Promise<boolean> {
    return await bcrypt.compare(userPassword, dbPassword);
  }

  public async signJwt({ payload, type }: { payload: JwtAddedPayload; type: 'token' | 'refresh' }): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        payload,
        type === 'refresh' ? appConfig.env.REFRESH_SECRET : appConfig.env.TOKEN_SECRET,
        {
          expiresIn:
            type === 'refresh' ? appConfig.env.REFRESH_SPAN : appConfig.env.IS_LOCAL ? '30d' : appConfig.env.TOKEN_SPAN,
        },
        (err, token) => {
          if (err) reject(err);
          resolve(token!);
        },
      );
    });
  }

  public async verifyJwt({
    secret,
    type,
  }: {
    secret: string;
    type: 'token' | 'refresh';
  }): Promise<(JwtPayload & JwtAddedPayload) | null> {
    return new Promise<(JwtPayload & JwtAddedPayload) | null>((resolve) => {
      jwt.verify(
        secret,
        type === 'refresh' ? appConfig.env.REFRESH_SECRET : appConfig.env.TOKEN_SECRET,
        (err, decoded) => {
          if (err ?? !decoded) return resolve(null);
          const { id } = decoded as JwtPayload & JwtAddedPayload;
          if (!id) resolve(null);
          resolve({ id });
        },
      );
    });
  }

  public async registerUser(input: NewUser) {
    try {
      const newUser: NewUser = {
        ...input,
      };
      const hashedPassword = await this.hashPassword(newUser.password);
      newUser.password = hashedPassword;
      const user = await this.authRepository.create(newUser);
      const token = await this.signJwt({
        payload: { id: user.id },
        type: 'token',
      });
      const refresh = await this.signJwt({
        payload: { id: user.id },
        type: 'refresh',
      });
      this.logger.silly('New user created: %o', user);
      return {
        token,
        refresh,
        user: user,
      };
    } catch (err) {
      if (err instanceof Error && err.message.match(/users_email_unique/)) {
        throw createHttpError.BadRequest('User with provided email already exists');
      }
      throw err;
    }
  }

  public async loginUser({ email, password }: Pick<NewUser, 'email' | 'password'>) {
    const user = await this.authRepository.get({ by: 'email', value: email });
    const failedMessage = 'Incorrect email or password';
    if (!user) throw createHttpError.NotAcceptable(failedMessage);
    const match = await this.validatePassword(password, user.password);
    if (!match) throw createHttpError.NotAcceptable(failedMessage);
    const token = await this.signJwt({
      payload: { id: user.id },
      type: 'token',
    });
    const refresh = await this.signJwt({
      payload: { id: user.id },
      type: 'refresh',
    });
    const userToSend: Omit<typeof user, 'password'> = { ...user };
    Reflect.deleteProperty(userToSend, 'password');
    this.logger.silly('New user logged in: %o', userToSend);
    return {
      token,
      refresh,
      user: userToSend,
    };
  }

  public async refreshToken({ refresh }: { refresh: string }) {
    const decoded = await this.verifyJwt({ type: 'refresh', secret: refresh });
    if (!decoded) throw createHttpError(400, 'Invalid refresh token');
    const { id } = decoded;
    const token = await this.signJwt({
      payload: { id },
      type: 'token',
    });
    const newRefresh = await this.signJwt({
      payload: { id },
      type: 'refresh',
    });
    return {
      token,
      refresh: newRefresh,
    };
  }

  public setCookie(res: ExpressResponse, { token, refresh }: { token: string; refresh?: string }) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: appConfig.env.isDev ? 'none' : 'strict', // ! Prevent CSRF
      maxAge: ms(appConfig.env.IS_LOCAL ? '30d' : appConfig.env.TOKEN_SPAN),
    });
    if (refresh) {
      res.cookie('refresh', refresh, {
        httpOnly: true,
        secure: true,
        sameSite: appConfig.env.isDev ? 'none' : 'strict', // ! Prevent CSRF
        maxAge: ms(appConfig.env.REFRESH_SPAN),
      });
    }
  }

  public clearCookie(res: ExpressResponse) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: appConfig.env.isDev ? 'none' : 'strict', // ! Prevent CSRF
    });
    res.clearCookie('refresh', {
      httpOnly: true,
      secure: true,
      sameSite: appConfig.env.isDev ? 'none' : 'strict', // ! Prevent CSRF
    });
  }

  public async getProfile(id: string) {
    const user = await this.authRepository.get({ by: 'id', value: id });
    if (!user) throw createHttpError.NotAcceptable('Incorrect email');
    const { email, firstName, lastName } = user;
    return {
      id: user.id,
      email,
      firstName,
      lastName,
    };
  }
}
