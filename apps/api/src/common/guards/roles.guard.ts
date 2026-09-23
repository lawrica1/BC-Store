import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Role } from "@prisma/client";

@Injectable()
export class AdminOrTechnicianGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { role?: string } }>();
    const role = request.user?.role;

    if (role === Role.ADMIN || role === Role.TECHNICIAN) {
      return true;
    }

    throw new ForbiddenException("Admin or technician access required.");
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { role?: string } }>();
    if (request.user?.role === Role.ADMIN) {
      return true;
    }

    throw new ForbiddenException("Admin access required.");
  }
}
