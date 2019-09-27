import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';

import { AppController, ConfirmationResponse, LoginResponse } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { getValidUser } from './users/users.service.spec';
import { UsersService } from './users/users.service';
import { UserConfirmation } from './model/user.conformation';
import { Optional } from './util/optional';
import { User } from './model/User';

describe('AppController', () => {
  let appController: AppController;
  let userService: UsersService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      imports: [AuthModule, UsersModule],
      providers: [],
    }).compile();

    appController = app.get<AppController>(AppController);
    userService = app.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('register', () => {
    it('should register an new user', async () => {
      const { email, username } = getValidUser();
      const response: ConfirmationResponse = await appController.register({ email, username });

      expect(response.email).toEqual(email);
    });

    it('should fail to register the same email twice', async () => {
      const { email, username } = getValidUser();
      await appController.register({ email, username });
      try {
        await appController.register({ email, username: `${username}1` });
        fail('should have failed');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(HttpException);
        if (error instanceof HttpException) {
          expect(error.getStatus()).toEqual(HttpStatus.CONFLICT);
          expect((error.getResponse() as any).property).toEqual('email');
        }
      }
    });

    it('should fail to register the same username twice', async () => {
      const { email, username } = getValidUser();
      await appController.register({ email, username });
      try {
        await appController.register({ email: `${email}1`, username });
        fail('should have failed');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(HttpException);
        if (error instanceof HttpException) {
          expect(error.getStatus()).toEqual(HttpStatus.CONFLICT);
          expect((error.getResponse() as any).property).toEqual('username');
        }
      }
    });
  });

  describe('confirm', () => {
    it('should confirm a user', async () => {
      const { email, username, password } = getValidUser();
      const confrimation: ConfirmationResponse = await appController.register({ email, username });
      try {
        const userConfirmation: Optional<UserConfirmation> = await userService.findConfirmationByEmail(email);
        expect(userConfirmation.success).toEqual(true);

        await appController.confirm(userConfirmation.value.conformationKey, { email: confrimation.email, password });
        const user: Optional<User> = await userService.findOneByEmail(confrimation.email);
        expect(user.success).toEqual(true);
        expect(user.value.confirmed).toEqual(true);
        expect(user.value.confirmationDate).toBeDefined();
      } catch (error) {
        fail(`should not throw an error: ${error.message}`);
      }
    });

    it('should fail with an invalid confirmation key', async () => {
      const { email, username, password } = getValidUser();
      const confrimation: ConfirmationResponse = await appController.register({ email, username });
      try {
        await appController.confirm('asadad32ecac2', { email: confrimation.email, password });
        fail('should throw an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(HttpException);
        if (error instanceof HttpException) {
          expect(error.getStatus()).toEqual(HttpStatus.NOT_FOUND);
        }
      }
    });
  });

  describe('login', () => {
    it('should provide a token for a valid login', async () => {
      const { email, username, password } = getValidUser();
      const confrimation: ConfirmationResponse = await appController.register({ email, username });
      try {
        const userConfirmation: Optional<UserConfirmation> = await userService.findConfirmationByEmail(email);
        expect(userConfirmation.success).toEqual(true);

        await appController.confirm(userConfirmation.value.conformationKey, { email: confrimation.email, password });
        const { token }: LoginResponse = await appController.login({ user: { username } });
        const decoded: any = jwt.decode(token);

        expect(token).toBeDefined();
        expect(decoded.username).toEqual(username);
        expect(decoded.exp).toBeDefined();
      } catch (error) {
        fail(`should not throw an error: ${error.message}`);
      }
    });
  });
});
