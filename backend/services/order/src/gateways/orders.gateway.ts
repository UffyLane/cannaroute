import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  WsOrderConfirmedEvent,
  WsDriverPositionEvent,
  WsOrderDeliveredEvent,
  WsNewJobEvent,
} from '@cannaroute/shared';

@WebSocketGateway({
  // CORS is configured via SocketIoAdapter in main.ts — do not read process.env here.
  namespace: '/orders',
})
export class OrdersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  afterInit(_server: Server) {
    this.logger.log('OrdersGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room } = data;
    const validRoom = /^(order|dispensary|driver):[a-f0-9-]{36}$/.test(room);
    if (!validRoom) {
      client.emit('error', { message: 'Invalid room format' });
      return;
    }
    client.join(room);
    this.logger.log(`Socket ${client.id} joined room ${room}`);
    client.emit('subscribed', { room });
  }

  emitOrderConfirmed(event: WsOrderConfirmedEvent) {
    this.server.to(`order:${event.order_id}`).emit('order:confirmed', event);
    this.server.to(`dispensary:${event.dispensary_id}`).emit('order:confirmed', event);
  }

  emitDriverPosition(event: WsDriverPositionEvent) {
    this.server.to(`order:${event.order_id}`).emit('driver:position', event);
  }

  emitOrderDelivered(event: WsOrderDeliveredEvent) {
    this.server.to(`order:${event.order_id}`).emit('order:delivered', event);
    this.server.to(`dispensary:${event.dispensary_id}`).emit('order:delivered', event);
  }

  emitNewJob(driverId: string, event: WsNewJobEvent) {
    this.server.to(`driver:${driverId}`).emit('driver:new_job', event);
  }

  emitOrderStatusChange(orderId: string, dispensaryId: string, status: string) {
    this.server.to(`order:${orderId}`).emit('order:status_changed', { order_id: orderId, status });
    this.server.to(`dispensary:${dispensaryId}`).emit('order:status_changed', { order_id: orderId, status });
  }
}
