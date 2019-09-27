import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { UserLogin } from '../model/user.login';
import { UserExternal } from '../model/user.external';
import { User } from '../model/User';
import { UserToken } from '../model/user.token';
import { Optional, None } from '../util/optional';
import { config } from '../util/configuration';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  async validateUserLogin({ email, password: pass }: UserLogin): Promise<Optional<UserExternal>> {
    const user: Optional<User> = await this.usersService.findOneByEmail(email);
    if (user.success && await this.isUserLoginValid(user.value, pass)) {
      // remove sensitive data from the user
      const { password, ...result } = user.value;
      return {
        value: result,
        success: true,
      };
    }
    return None;
  }

  async generateToken(user: UserToken): Promise<string> {
    const exp = new Date();
    exp.setDate(exp.getDate() + config.token.duration);
    return jwt.sign({
      ...user,
      exp: new Date(Date.now() + config.token.duration).getTime() / 1000,
    }, config.token.secret);
  }

  private async isUserLoginValid(user: User, password: string) {
    return user && user.confirmed && await bcrypt.compare(password, user.password);
  }
}
