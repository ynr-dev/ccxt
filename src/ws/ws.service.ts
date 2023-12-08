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
    const exchangeIns = this.createExchangeProInstance(exchangeId);


    let status: boolean = true;


    while (status) {
      client.on('close', function close() {
        console.log("connection closed")
        status = false
      });

      try {
        const candles = await exchangeIns.watchOHLCV(this.getCoin(symbol), timeframe,)
        const ticker = symbol.toLocaleLowerCase();

        let exchange = exchangeId
        if("htx" === exchangeId){
          exchange = "huobi";
        }
        if(status){
          const [kline] = candles;
          client.send(JSON.stringify({exchange, ticker, timeframe, kline }));
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

  async fetchTimeframes(exchangeId: string, symbol: string): Promise<any> {

    const exchange = this.createExchangeInstance(exchangeId);
    const ticker = await exchange.fetchTicker(this.getCoin(symbol));
    const price:string = ticker.low.toString();

    let scale;
    if(price.indexOf(".") != -1){

      scale = price.split(".")[1].length
    }else{
      scale = 0
    }
    return {scale, timeframes:Object.keys(exchange.timeframes)}
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
