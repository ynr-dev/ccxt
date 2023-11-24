import { Controller, Get, Param } from '@nestjs/common';
import { WsService } from './ws.service';
import {OHLCV} from "ccxt";

@Controller('rest')
export class WsController {
    constructor(private readonly wsService: WsService) {}

    @Get(':exchangeId/:symbol/fetchOHLCV/:timeframe/:since')
    async fetchOHLCV(
        @Param('exchangeId') exchangeId: string,
        @Param('symbol') symbol: string,
        @Param('timeframe') timeframe: string,
        @Param('since') since: number,
    ): Promise<any> {
        return await this.wsService.fetchOHLCV(exchangeId, symbol, timeframe, since);
    }

    @Get(':exchangeId/:symbols/fetchTickers')
    async fetchTickers(
        @Param('exchangeId') exchangeId: string,
        @Param('symbols') symbols: string,
    ): Promise<any> {
        return await this.wsService.fetchTickers(exchangeId, symbols);
    }
}