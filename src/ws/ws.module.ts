import { Module } from '@nestjs/common';
import {WsService} from "./ws.service";
import {WsController} from "./ws.controller";
import {WsGateway} from "./ws.gateway";
import {GateioService} from "./ws.gateio";
import {GopaxService} from "./ws.gopax";


@Module({
    imports: [WsModule],
    controllers: [WsController],
    providers: [WsService, WsGateway, GateioService, GopaxService],
})
export class WsModule {}
