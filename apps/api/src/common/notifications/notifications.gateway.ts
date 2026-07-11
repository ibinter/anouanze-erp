import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true, namespace: '/notifications' })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly userSockets = new Map<string, string>();
  private readonly orgSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté : ${client.id}`);

    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }

    for (const [, sockets] of this.orgSockets.entries()) {
      sockets.delete(client.id);
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: string; organisationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, organisationId } = data;

    this.userSockets.set(userId, client.id);

    if (!this.orgSockets.has(organisationId)) {
      this.orgSockets.set(organisationId, new Set());
    }
    this.orgSockets.get(organisationId)!.add(client.id);

    this.logger.log(`User ${userId} de l'org ${organisationId} enregistré sur ${client.id}`);
    client.emit('registered', { userId, organisationId });
  }

  sendToUser(userId: string, event: string, data: unknown) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  sendToOrganisation(orgId: string, event: string, data: unknown) {
    const sockets = this.orgSockets.get(orgId);
    if (sockets) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit(event, data);
      }
    }
  }
}
