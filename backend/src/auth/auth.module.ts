import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { UserModule } from '../user/user.module';
import { ParticipantModule } from '../participant/participant.module';
import { JeModule } from '../je/je.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    UserModule,
    ParticipantModule,
    JeModule,
    MailModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    GoogleStrategy,
    LocalStrategy,
    RefreshTokenStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
