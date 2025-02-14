import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HbmService } from './hbm.service';
import { HeartbeatMeasurement } from './types/heartbeat.types';

@WebSocketGateway({ cors: true })
export class HbmGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private hbmService: HbmService) {}

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('sendHeartbeat')
  handleHeartbeat(@MessageBody() heartRate: number) {
    const measurement: HeartbeatMeasurement = {
      voltage: heartRate,
      timestamp: Date.now(),
    };

    const alert = this.hbmService.processMeasurement(measurement);
    if (alert) {
      this.server.emit('receiveAlert', alert);
    }
    this.server.emit('receiveHeartbeat', heartRate);
  }

  @SubscribeMessage('requestHistory')
  handleRequestHistory(client: Socket) {
    client.emit('receiveHistory', this.hbmService.getIrregularities());
  }
}
