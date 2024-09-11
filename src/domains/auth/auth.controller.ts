import { inject } from 'inversify';
import {
  Route,
  Post,
  Controller,
  SuccessResponse,
  Tags,
  Body,
  Middlewares,
  Example,
  Request,
  Get,
  Security,
} from 'tsoa';
import { AuthService } from './auth.service';
// NOTE: importing DTO with absolute path causes TSOA generation to fail because it takes it as a node module
import { SignUpUserInput, SignInUserInput } from './auth.dto';
import { validateBody } from '@/middlewares/validator';
import type { SignUpUserResponse, SignInUserResponse, GetUserProfileResponse } from './auth.interface';
import type { Request as ExpressRequest } from 'express';
import { AuthUserRequest } from '@/interfaces/helper';
import createHttpError from 'http-errors';

@Route('auth')
@Tags('Auth')
export class AuthController extends Controller {
  constructor(@inject(AuthService) private readonly authService: AuthService) {
    super();
  }

  /**
  Register a new user
  @example body  {
    "email": "user1@test.com",
    "firstName": "user1",
    "lastName": "test",
    "password": "123456"
  }
  */
  @Post('signup')
  @SuccessResponse(201, 'Created')
  @Middlewares([validateBody(SignUpUserInput)])
  @Example<SignUpUserResponse>({
    id: 'kvO_aSw8Kn...',
    email: 'user1@test.com',
    firstName: 'user1',
    lastName: 'test',
  })
  public async signUpUser(@Body() body: SignUpUserInput, @Request() req: ExpressRequest): Promise<SignUpUserResponse> {
    this.setStatus(201);
    const { user, token, refresh } = await this.authService.registerUser(body);
    if (!req.res) throw createHttpError.InternalServerError('Response unavailable');
    this.authService.setCookie(req.res, { token, refresh });
    return user;
  }

  /**
  Log in a user
  @example body  {
    "email": "user1@test.com",
    "password": "123456"
  }
  */
  @Post('signin')
  @Middlewares([validateBody(SignInUserInput)])
  @Example<SignInUserResponse>({
    id: 'kvO_aSw8Kn...',
    email: 'user1@test.com',
    firstName: 'user1',
    lastName: 'test',
  })
  public async signInUser(@Body() body: SignInUserInput, @Request() req: ExpressRequest): Promise<SignInUserResponse> {
    const { user, token, refresh } = await this.authService.loginUser(body);
    if (!req.res) throw createHttpError.InternalServerError('Response unavailable');
    this.authService.setCookie(req.res, { token, refresh });
    return user;
  }

  /**
  Refresh user token
  */
  @Post('refresh')
  @Example<string>('Ok')
  public async refreshUserToken(@Request() req: ExpressRequest): Promise<string> {
    if (!req.res) throw createHttpError.InternalServerError('Response unavailable');
    const refresh = req.cookies.refresh as string | undefined;
    if (!refresh) throw createHttpError.Unauthorized('No refresh token');
    req.res.clearCookie('token');
    req.res.clearCookie('refresh');
    const { token, refresh: newRefresh } = await this.authService.refreshToken({ refresh });
    this.authService.setCookie(req.res, { token, refresh: newRefresh });
    return 'Ok';
  }

  /**
  Get user profile
  */
  @Get('profile')
  @Security('cookieAuth')
  public getUserProfile(@Request() req: AuthUserRequest): Promise<GetUserProfileResponse> {
    if (!req.user) throw new Error();
    return this.authService.getProfile(req.user.id);
  }

  /**
  Log out user
  */
  @Post('signout')
  @Example<string>('Ok')
  public logoutUser(@Request() req: ExpressRequest): string {
    if (!req.res) throw createHttpError.InternalServerError('Response unavailable');
    this.authService.clearCookie(req.res);
    return 'Ok';
  }
}
