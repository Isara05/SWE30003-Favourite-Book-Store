import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { AccountRole } from '../domain/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  // Handles the can activate logic.
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AccountRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Handles the if logic.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { role?: AccountRole } }>();
    return requiredRoles.includes(request.user?.role ?? AccountRole.Customer);
  }
}
