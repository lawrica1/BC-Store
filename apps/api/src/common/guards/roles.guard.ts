import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class AdminOrTechnicianGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { role?: string }; headers?: Record<string, string | string[] | undefined> }>();
    const roleHeader = request.headers?.["x-user-role"];
    const role = request.user?.role ?? (Array.isArray(roleHeader) ? roleHeader[0] : roleHeader);

    if (role === "ADMIN" || role === "TECHNICIAN") {
      return true;
    }

    throw new ForbiddenException("Admin or technician access required.");
  }
}
