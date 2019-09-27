import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

import { DuplicateError } from '../util/duplicate.error';
import { User } from '../model/User';
import { UserRegister } from '../model/User.register';
import { UserConfirmation } from '../model/user.conformation';
import { UserPassword } from '../model/user.password';
import { formatString } from '../util/string';
import { Optional } from '../util/optional';
import { config } from '../util/configuration';
import { NotFoundError } from '../util/notfound.error';
import { ExpiredError } from '../util/expired.error';

export enum ErrorMessages {
  USERNAME_ALREADY_EXISTS = 'username already in use',
  USERNAME_DOES_NOT_EXIST = 'user with username "{username}" does not exist',
  EMAIL_ALREADY_EXISTS = 'email already in use',
  EMAIL_DOES_NOT_EXIST = 'user with email "{email}" does not exist',
  CONFIRMATION_DOES_NOT_EXIST = 'confirmation does not exist',
  CONFIRMATION_EXPIRED = 'confirmation is expired',
}

@Injectable()
export class UsersService {

  private users: User[];
  private userConfirmations: UserConfirmation[];

  constructor() {
    this.userConfirmations = [];
    this.users = [];
  }

  /**
   * Register a new user in the database. A new user is not confirmed.
   * A `UserConfirmation` object will be created for the new user.
   *
   * @param user user date for the newly registered user
   * @returns confirmation object containing the `conformationKey` and `email`
   * @throws `DuplicateError` if a value is already used and needs to be unique
   */
  async createUser(user: UserRegister): Promise<UserConfirmation> {
    const emailAlreadyRegistered = await this.findOneByEmail(user.email);
    if (emailAlreadyRegistered.success) {
      throw new DuplicateError(ErrorMessages.EMAIL_ALREADY_EXISTS, 'email');
    }
    const usernameAlreadyRegistered = await this.findOneByUsername(user.username);
    if (usernameAlreadyRegistered.success) {
      throw new DuplicateError(ErrorMessages.USERNAME_ALREADY_EXISTS, 'username');
    }

    this.users.push({
      ...user,
      userId: '',
      password: '',
      confirmed: false,
      registrationDate: new Date(),
    });
    return this.createConfirmationKey(user.email);
  }

  /**
   * Confirms a user and sets the password for the user.
   * It will store the `password` hashed and set `confirmationDate`.
   *
   * @param userValues password for the user
   */
  async confirmUser(confirmationKey: string, userValues: UserPassword) {
    const userConfirmation: Optional<UserConfirmation> = await this.findConfirmationByKey(confirmationKey);
    if (!userConfirmation.success) {
      throw new NotFoundError(ErrorMessages.CONFIRMATION_DOES_NOT_EXIST);
    }
    if (userConfirmation.value.expires.getTime() < Date.now()) {
      throw new ExpiredError(ErrorMessages.CONFIRMATION_EXPIRED);
    }

    const user: Optional<User> = await this.findOneByEmail(userValues.email);
    if (!user.success) {
      throw new NotFoundError(formatString(ErrorMessages.EMAIL_DOES_NOT_EXIST, {email: userValues.email}));
    }
    for (const property in userValues) {
      if (userValues.hasOwnProperty(property)) {
        if (property === 'password') {
          user.value[property] = bcrypt.hashSync(userValues[property], bcrypt.genSaltSync());
        } else {
          user.value[property] = userValues[property];
        }
      }
    }
    user.value.confirmed = true;
    user.value.confirmationDate = new Date();

    await this.deleteConfirmationByEmail(user.value.email);
  }

  async findOneByEmail(email: string): Promise<Optional<User>> {
    const result: User | undefined = this.users.find(user => user.email === email);
    return {
      value: result,
      success: result ? true : false,
    };
  }

  async findOneByUsername(username: string): Promise<Optional<User>> {
    const result: User | undefined = this.users.find(user => user.username === username);
    return {
      value: result,
      success: result ? true : false,
    };
  }

  async deleteUserByEmail(email: string): Promise<void> {
    this.users = this.users.filter(user => user.email !== email);
    this.userConfirmations = this.userConfirmations.filter(userConfirmation => userConfirmation.email !== email);
  }

  async createConfirmationKey(email: string): Promise<UserConfirmation> {
    const confirmation: UserConfirmation = {
      conformationKey: crypto.randomBytes(16).toString('base64'),
      email,
      expires: new Date(Date.now() + config.confirmation.duration),
    };
    this.userConfirmations.push(confirmation);
    return confirmation;
  }

  async findConfirmationByKey(confirmationKey: string): Promise<Optional<UserConfirmation>> {
    const result: UserConfirmation | undefined = this.userConfirmations.find(confirmation => confirmation.conformationKey === confirmationKey);
    return {
      value: result,
      success: result ? true : false,
    };
  }

  async findConfirmationByEmail(email: string): Promise<Optional<UserConfirmation>> {
    const result: UserConfirmation | undefined = this.userConfirmations.find(confirmation => confirmation.email === email);
    return {
      value: result,
      success: result ? true : false,
    };
  }

  async deleteConfirmationByKey(confirmationKey: string): Promise<void> {
    this.userConfirmations = this.userConfirmations.filter(confirmation => confirmation.conformationKey !== confirmationKey);
  }

  async deleteConfirmationByEmail(email: string): Promise<void> {
    this.userConfirmations = this.userConfirmations.filter(confirmation => confirmation.email !== email);
  }
}
