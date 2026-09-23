import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Identifies the caller when a valid token is present but never rejects — for endpoints that
 * accept guests and only enrich the result for logged-in users (e.g. guest checkout).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<TUser>(_error: unknown, user: TUser | false): TUser | null {
    return user || null;
  }
}
