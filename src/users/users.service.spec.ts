import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { UsersService, ErrorMessages } from './users.service';
import { User } from '../model/User';
import { formatString } from '../util/string';
import { ConfigModule } from '../config/config.module';
import { getValidUser } from './users.data';

describe('UsersService', () => {

  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
      ],
      imports: [
        ConfigModule,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create an user if email and username are unique', async () => {
      const user: User = getValidUser();
      const userConfirmation = await service.createUser({ email: user.email, username: user.username });
      const createdUser = await service.findOneByEmail(user.email);

      // cleanup
      await service.deleteUserByEmail(user.email);

      // check the confirmation returned by createUser
      expect(userConfirmation.email).toEqual(user.email);
      expect(userConfirmation.conformationKey).toBeDefined();

      // check that the created user is initlized correctly
      expect(createdUser.success).toEqual(true);
      expect(createdUser.value.email).toEqual(user.email);
      expect(createdUser.value.username).toEqual(user.username);
      expect(createdUser.value.confirmed).toEqual(false);
      expect(createdUser.value.registrationDate).toBeDefined();
    });

    it('should throw an error if the email is already in use', async () => {
      const user: User = getValidUser();
      await service.createUser({ email: user.email, username: user.username });
      try {
        await service.createUser({ email: user.email, username: `${user.username}1` });
        fail('should have thrown an error because the email is already in use');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toEqual(ErrorMessages.EMAIL_ALREADY_EXISTS);
      } finally {
        // cleanup
        await service.deleteUserByEmail(user.email);
      }
    });

    it('should throw an error if the username is already in use', async () => {
      const {email, username} = getValidUser();
      await service.createUser({ email, username });
      try {
        await service.createUser({ email: `${email}1`, username });
        fail('should have thrown an error because the email is already in use');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toEqual(ErrorMessages.USERNAME_ALREADY_EXISTS);
      } finally {
        // cleanup
        await service.deleteUserByEmail(email);
      }
    });
  });

  describe('confirmUser', () => {
    it('should activate an inactive user', async () => {
      const {password, email, username} = getValidUser();
      const { conformationKey, email: confirmationEmail } = await service.createUser({ email, username });
      await service.confirmUser(conformationKey, { email: confirmationEmail, password});
      const createdUser = await service.findOneByEmail(email);
      const undefinedConirmation = await service.findConfirmationByKey(conformationKey);
      // cleanup
      await service.deleteUserByEmail(email);

      // check user activation changes
      expect(createdUser.success).toEqual(true);
      expect(createdUser.value.confirmed).toEqual(true);
      expect(createdUser.value.confirmationDate).toBeDefined();
      expect(await bcrypt.compare(password, createdUser.value.password)).toEqual(true);

      // check that the confirmation gets deleted when confirming a user
      expect(undefinedConirmation.success).toEqual(false);
    });

    it('should throw an error if the user cannot be found', async () => {
      const {password, email} = getValidUser();
      try {
        await service.confirmUser('', { email, password});
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toEqual(formatString(ErrorMessages.CONFIRMATION_DOES_NOT_EXIST, {email}));
      }
    });
  });
});
