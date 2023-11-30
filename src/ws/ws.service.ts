import { Injectable } from '@nestjs/common';
import * as ccxt from 'ccxt';
import {Socket} from "socket.io";

@Injectable()
export class WsService {

  createExchangeProInstance(exchangeId: string) {
    const exchangeClass = ccxt.pro[exchangeId];
    if (!exchangeClass) {
      throw new Error(`Exchange '${exchangeId}' not found`);
    }
    return new exchangeClass();
  }

  createExchangeInstance(exchangeId: string) {
    const exchangeClass = ccxt[exchangeId];
    if (!exchangeClass) {
      throw new Error(`Exchange '${exchangeId}' not found`);
    }
    return new exchangeClass();
  }

  async watchOHLCV(exchangeId: string, symbol: string, timeframe: string, client: Socket): Promise<any> {
    const exchange = this.createExchangeProInstance(exchangeId);


    let status: boolean = true;


    while (status) {
      client.on('close', function close() {
        console.log("connection closed")

        return;
      });

      try {
        const candles = await exchange.watchOHLCV(symbol.toLocaleUpperCase(), timeframe,)
        const ticker = symbol.toLocaleLowerCase();
        if(status){
          const [kline] = candles;
          client.send(JSON.stringify({exchangeId, ticker, timeframe, kline }));
        }

      } catch (e) {
        console.log (e)
        return;
      }
    }
  }

  async fetchTickers(exchangeId: string, symbols: string): Promise<any> {
    const exchange = this.createExchangeInstance(exchangeId);
    const strArr = symbols.split(',');
    return await exchange.fetchTickers(strArr)
  }

  async fetchOHLCV(exchangeId: string, symbol: string, timeframe: string, since: number): Promise<any> {
    const exchange = this.createExchangeInstance(exchangeId);

    return await exchange.fetchOHLCV(symbol, timeframe, since, 1000);
  }
}
