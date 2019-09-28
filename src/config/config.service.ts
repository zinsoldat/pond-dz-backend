import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

export enum Mode {
  FILE,
  ENV,
}

export interface Config {
  port: number;
  certificates: {
    privateKey: string;
    publicKey: string;
  };
  confirmation: {
    duration: number,
  };
  token: {
    duration: number;
    secret: string;
    path: string;
  };
}

@Injectable()
export class ConfigService {
  private configuration: Config;
  constructor(private readonly mode: Mode) {
    this.loadConfig();
  }

  get config(): Config {
    return this.configuration;
  }

  loadConfig() {
    switch (this.mode) {
      case Mode.FILE:
        this.configuration = dotenv.parse(fs.readFileSync(`${process.env.NODE_ENV || 'development'}.env`));
        break;
      case Mode.ENV:
      default:
        this.configuration = {
          port: +this.loadEnvVariable('PORT', '4000'),
          certificates: {
            privateKey: this.loadEnvVariable('SERVER_PRIVATE_KEY', ''),
            publicKey: this.loadEnvVariable('SERVER_PUBLIC_KEY', ''),
          },
          confirmation: {
            duration: +this.loadEnvVariable('CONFIRMATION_VALID_TIME', `${1000 * 60 * 10}}`),
          },
          token: {
            duration: +this.loadEnvVariable('TOKEN_VALID_TIME', `${1000 * 60 * 10}}`),
            secret: this.loadEnvVariable('TOKEN_SECRET', '1234secret!sd'),
            path: this.loadEnvVariable('TOKEN_SECRET_PATH', ''),
          },
        };
    }
  }

  private loadEnvVariable(name: string, defaultValue?: string): string {
    let value = process.env[name];
    if (process.env[name] === undefined) {
      // console.debug(`env variable ${name} not set - use default value '${defaultValue}'`);
      value = defaultValue;
    }
    return value;
  }
}
