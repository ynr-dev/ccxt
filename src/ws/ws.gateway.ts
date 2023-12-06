import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,

} from '@nestjs/websockets';
import { WsService } from './ws.service';
import {Socket} from "socket.io";
import {UseGuards} from "@nestjs/common";

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:3000', // 허용할 도메인을 여기에 설정
    }
})
export class WsGateway {

    constructor(private readonly wsService: WsService) {}

    @SubscribeMessage('kline')
    onEvent(client: Socket, data: { exchangeId: string, symbol: string, timeframe: string, since: number }): void {
        if("huobi" === data.exchangeId){
            data.exchangeId = "htx";
        }

        this.wsService.watchOHLCV(data.exchangeId, data.symbol, data.timeframe,  client);

    }

}

