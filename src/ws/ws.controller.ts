import { Controller, Get, Param } from '@nestjs/common';
import { WsService } from './ws.service';
import {OHLCV} from "ccxt";

@Controller('rest')
export class WsController {
    constructor(private readonly wsService: WsService) {}

    @Get('/fetchOHLCV/:exchangeId/:symbol/:timeframe/:since')
    async fetchOHLCV(
        @Param('exchangeId') exchangeId: string,
        @Param('symbol') symbol: string,
        @Param('timeframe') timeframe: string,
        @Param('since') since: number,
    ): Promise<any> {
        if("huobi" === exchangeId){
            exchangeId = "htx";
        }

        return await this.wsService.fetchOHLCV(exchangeId, symbol, timeframe, since);
    }

    @Get(':exchangeId/:symbols/fetchTickers')
    async fetchTickers(
        @Param('exchangeId') exchangeId: string,
        @Param('symbols') symbols: string,
    ): Promise<any> {
        if("huobi" === exchangeId){
            exchangeId = "htx";
        }

        return await this.wsService.fetchTickers(exchangeId, symbols);
    }

    @Get(':exchangeId/timeframes')
    async fetchTimeframes(
        @Param('exchangeId') exchangeId: string,
    ): Promise<any> {
        if("huobi" === exchangeId){
            exchangeId = "htx";
        }

        return await this.wsService.fetchTimeframes(exchangeId);
    }
}