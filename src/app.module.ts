import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { ConfigService } from './config/config.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
  ],
})
export class AppModule {}
