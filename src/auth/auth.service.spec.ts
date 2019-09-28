import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';

import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { getValidUser } from '../users/users.data';
import { UsersService } from '../users/users.service';
import { UserExternal } from '../model/user.external';
import { Optional } from '../util/optional';
import { ConfigModule } from '../config/config.module';

describe('AuthService', () => {

  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
      ],
      imports: [
        UsersModule,
        ConfigModule,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUserLogin', () => {
    it('should return the user if password and username match', async () => {
      const { email, username, password } = getValidUser();
      try {
        const { conformationKey } = await usersService.createUser({ email, username });
        await usersService.confirmUser(conformationKey, { email, password });
        const user: Optional<UserExternal> = await service.validateUserLogin({ email, password });

        expect(user.success).toEqual(true);
        expect(user.value.email).toEqual(email);
      } catch (error) {
        fail(`could not create user for tests: ${error.message}`);
      } finally {
        usersService.deleteUserByEmail(email);
      }
    });

    it('should fail if the email does not match', async () => {
      const { email, username, password } = getValidUser();
      try {
        const { conformationKey } = await usersService.createUser({ email, username });
        await usersService.confirmUser(conformationKey, { email, password });
        const user: Optional<UserExternal> = await service.validateUserLogin({ email: `${email}1`, password });

        expect(user.success).toEqual(false);
        expect(user.value).toBeUndefined();
      } catch (error) {
        fail(`could not create user for tests: ${error.message}`);
      } finally {
        usersService.deleteUserByEmail(email);
      }
    });

    it('should fail if the password does not match', async () => {
      const { email, username, password } = getValidUser();
      try {
        const { conformationKey } = await usersService.createUser({ email, username });
        await usersService.confirmUser(conformationKey, { email, password });
        const user: Optional<UserExternal> = await service.validateUserLogin({ email, password: `${password}1` });

        expect(user.success).toEqual(false);
        expect(user.value).toBeUndefined();
      } catch (error) {
        fail(`could not create user for tests: ${error.message}`);
      } finally {
        usersService.deleteUserByEmail(email);
      }
    });
  });

  describe('generateToken', () => {
    it('should create a token for a user', async () => {
      const { email, username, password } = getValidUser();
      try {
        const { conformationKey } = await usersService.createUser({ email, username });
        await usersService.confirmUser(conformationKey, { email, password });
        const token = await service.generateToken({username});
        const decoded: any = jwt.decode(token);

        expect(token).toBeDefined();
        expect(decoded.username).toEqual(username);
        expect(decoded.exp).toBeDefined();
      } catch (error) {
        fail(`could not create user for tests: ${error.message}`);
      } finally {
        usersService.deleteUserByEmail(email);
      }
    });
  });
});
