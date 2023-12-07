import { Injectable } from '@nestjs/common';
import * as ccxt from 'ccxt';
import {WebSocket} from "ws";

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

  async watchOHLCV(exchangeId: string, symbol: string, timeframe: string, client: WebSocket): Promise<any> {
    const exchange = this.createExchangeProInstance(exchangeId);


    let status: boolean = true;


    while (status) {
      client.on('close', function close() {
        console.log("connection closed")
        status = false
      });

      try {
        const candles = await exchange.watchOHLCV(this.getCoin(symbol), timeframe,)
        const ticker = symbol.toLocaleLowerCase();
        if(status){
          const [kline] = candles;
          client.send(JSON.stringify({exchangeId, ticker, timeframe, kline }));
        }else{
          return;
        }

      } catch (e) {
        console.log (e)
        return;
      }
    }
  }

  async fetchTickers(exchangeId: string, symbols: string): Promise<any> {
    const exchange = this.createExchangeInstance(exchangeId);
    symbols = this.getCoin(symbols)
    const strArr = symbols.split(',');
    let data

    if(symbols != 'ALL'){

      data =  await exchange.fetchTickers(strArr)

    }else{
      data =  await exchange.fetchTickers()
    }

    const arrData = Object.entries(data);
    const filteredArrData = arrData.filter(
        (item:object) =>
            item[1].symbol.split("/")[1] === "KRW" ||
            item[1].symbol.split("/")[1] === "USDT"
    );
    const result = filteredArrData.map((item:object) => ({
      symbol: item[1].symbol,
      price: item[1].close,
      changeRate: item[1].percentage,
      volume: item[1].quoteVolume,
    }));
    result.sort((a, b) => b.volume - a.volume);
    return result
  }

  async fetchTimeframes(exchangeId: string): Promise<any> {
    const exchange = this.createExchangeInstance(exchangeId);
    return Object.keys(exchange.timeframes)
  }

  async fetchOHLCV(exchangeId: string, symbol: string, timeframe: string, since: number): Promise<any> {
    const exchange = this.createExchangeInstance(exchangeId);

    try {
      return await exchange.fetchOHLCV(this.getCoin(symbol), timeframe, since, 1000);
    }catch (e) {
      return [];
    }
  }

  getCoin(coin: String): string{
    return coin.toLocaleUpperCase().replace("_", "/")
  }
}
