import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'favorite-books-secret',
    });
  }

  // Checks whether the validate details are usable.
  async validate(payload: { sub: string; email: string; role: string; name: string }) {
    const user = await this.authService.validateUser(payload.email);
    return user ?? { id: payload.sub, email: payload.email, role: payload.role, name: payload.name };
  }
}
