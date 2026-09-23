import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import type { JwtPayload } from "../auth/auth.service";

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true
  }
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const rawToken = client.handshake.auth?.token as string | undefined;
    const payload = this.authenticate(rawToken);
    if (!payload) {
      this.logger.warn(`Rejecting unauthenticated socket: ${client.id}`);
      client.disconnect(true);
      return;
    }

    this.logger.log(`Socket connected: ${client.id}`);
  }

  @SubscribeMessage("join-admin-room")
  joinAdminRoom(client: Socket, token?: string) {
    const rawToken = token ?? (client.handshake.auth?.token as string | undefined);
    const payload = this.authenticate(rawToken);
    if (!payload) {
      return { joined: false, error: "Admin or technician access required." };
    }

    // Admins see every event; technicians only hear about tickets assigned to them.
    void client.join(payload.role === "ADMIN" ? "admin-room" : `tech-${payload.sub}`);
    return { joined: true };
  }

  private authenticate(rawToken: string | undefined): JwtPayload | null {
    try {
      const payload = this.jwtService.verify<JwtPayload>(rawToken ?? "");
      return payload.role === "ADMIN" || payload.role === "TECHNICIAN" ? payload : null;
    } catch {
      return null;
    }
  }

  emitTicketCreated(ticket: unknown) {
    this.server?.to("admin-room").emit("ticket-created", ticket);
  }

  emitTicketUpdated(ticket: { assignedTo?: string | null }) {
    const rooms = ["admin-room", ...(ticket.assignedTo ? [`tech-${ticket.assignedTo}`] : [])];
    this.server?.to(rooms).emit("ticket-updated", ticket);
  }

  emitNewHomeVisit(ticket: unknown) {
    this.server?.to("admin-room").emit("new-home-visit", ticket);
  }

  emitOrderUpdated(order: unknown) {
    this.server?.to("admin-room").emit("order-updated", order);
  }
}
