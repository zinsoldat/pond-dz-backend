import { Controller, Request, Post, UseGuards, Get, Body, HttpStatus, Param, HttpException, Res, Redirect } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { UserExternal } from './model/user.external';
import { UserRegister } from './model/User.register';
import { UserPassword } from './model/user.password';
import { NotFoundError } from './util/notfound.error';
import { DuplicateError } from './util/duplicate.error';
import { ExpiredError } from './util/expired.error';
import { UserToken } from './model/user.token';

export interface LoginResponse {
  token: string;
}

export interface ConfirmationResponse {
  email: string;
}

@Controller('api')
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() user: UserRegister): Promise<ConfirmationResponse> {
    try {
      const { email } = await this.userService.createUser(user);
      return { email };
    } catch (error) {
      if (error instanceof DuplicateError) {
        throw new HttpException({message: error.message, property: error.property}, HttpStatus.CONFLICT);
      } else {
        throw new HttpException({message: error.message}, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post('confirm/:confirmationKey')
  @Redirect('login')
  async confirm(@Param('confirmationKey') confirmationKey: string, @Body() user: UserPassword) {
    try {
      await this.userService.confirmUser(confirmationKey, user);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof ExpiredError) {
        throw new HttpException(error.message, HttpStatus.GONE);
      } else {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: {user: UserToken}): Promise<LoginResponse> {
    return { token: await this.authService.generateToken(req.user) };
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Request() req): Promise<UserExternal> {
    return req.user;
  }
}
