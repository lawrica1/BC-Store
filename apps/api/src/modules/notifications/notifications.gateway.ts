import { Logger } from "@nestjs/common";
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

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

  handleConnection(client: Socket) {
    this.logger.log(`Socket connected: ${client.id}`);
  }

  @SubscribeMessage("join-admin-room")
  joinAdminRoom(client: Socket) {
    void client.join("admin-room");
    return { joined: true };
  }

  emitTicketCreated(ticket: unknown) {
    this.server?.to("admin-room").emit("ticket-created", ticket);
  }

  emitTicketUpdated(ticket: unknown) {
    this.server?.to("admin-room").emit("ticket-updated", ticket);
  }

  emitNewHomeVisit(ticket: unknown) {
    this.server?.to("admin-room").emit("new-home-visit", ticket);
  }

  emitOrderUpdated(order: unknown) {
    this.server?.to("admin-room").emit("order-updated", order);
  }
}
