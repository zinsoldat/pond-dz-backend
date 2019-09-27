
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';

import { AuthService } from './auth.service';
import { UserExternal } from '../model/user.external';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(email: string, password: string): Promise<UserExternal> {
    const user = await this.authService.validateUserLogin({email, password});
    if (user.success) {
      throw new UnauthorizedException();
    }
    return user.value;
  }
}
