import { Module } from '@nestjs/common';
import { ConfigService, Mode } from './config.service';

@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(Mode.ENV),
    },
  ],
  exports: [
    ConfigService,
  ],
})
export class ConfigModule {}
