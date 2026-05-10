import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('supabase.jwtSecret'),
      algorithms: ['HS256'],
    });
  }

  validate(payload: Record<string, unknown>) {
    if (!payload?.sub) throw new UnauthorizedException();
    return { userId: payload.sub, email: payload.email };
  }
}
