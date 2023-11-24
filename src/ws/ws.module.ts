import { Module } from '@nestjs/common';
import {WsService} from "./ws.service";
import {WsController} from "./ws.controller";
import {WsGateway} from "./ws.gateway";


@Module({
    imports: [WsModule],
    controllers: [WsController],
    providers: [WsService, WsGateway],
})
export class WsModule {}
