import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class AdminOrTechnicianGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { role?: string } }>();
    const role = request.user?.role;

    if (role === "ADMIN" || role === "TECHNICIAN") {
      return true;
    }

    throw new ForbiddenException("Admin or technician access required.");
  }
}
