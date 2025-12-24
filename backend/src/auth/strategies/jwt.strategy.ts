import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { 
      sub: payload.sub,
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role,
      status: payload.status,
      img: payload.img
    };
  }
}
