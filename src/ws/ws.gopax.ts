import {Injectable} from "@nestjs/common";
import {WebSocket} from "ws";

@Injectable()
export class GopaxService {

    async fetchTickers(symbols):Promise<any>{
        // const strArr = symbols.split(',');

        const axios = require('axios');
        const response = await axios.get('https://api.gopax.co.kr/tickers');
        const data = response.data;

        const result = data.map((item:any) => ({
            symbol: item.tradingPairName.replace("-", "/"),
            price: item.last,
            changeRate: (item.last-item.open)/item.open*100,
            volume: item.quoteVolume,
        }));
        result.sort((a, b) => b.volume - a.volume);

        return result
    }

    async fetchOHLCV(symbol: string, timeframe: string, since: number):Promise<any>{
        // const strArr = symbols.split(',');
        const interval = this.getInterval(timeframe);
        console.log(new Date(since))
        console.log(interval)
        const axios = require('axios');
        const response = await axios.get('https://api.gopax.co.kr/trading-pairs/'+symbol.replace("_", "-").toLocaleUpperCase()+'/candles?start='+(since-1000*60*interval*100)+'&end='+since+'&interval='+interval);
        const data = response.data;

        data.forEach((item: any) =>{
            console.log(new Date(item[0]))
            console.log(item[0])

        })
        return data.map((item: any) => [item[0], item[3], item[2], item[1], item[4], item[5]])
    }

    async fetchTimeframes(exchangeId: string, symbol: string): Promise<any> {
        const axios = require('axios');
        const response = await axios.get('https://api.gopax.co.kr/trading-pairs/'+symbol.replace("_", "-").toLocaleUpperCase()+'/ticker');
        const data:any = response.data;
        const price = data.price?.toString();

        let scale;
        if (price && price.indexOf(".") !== -1) {
            scale =  price.split(".")[1].length;
        } else {
            scale =  0;
        }

        const timeframes = ['1m','5m','30m','1d'];
        return {scale, timeframes};
    }

    getInterval(timeframe: string): number{
        switch (timeframe) {

            case "1m":
                return 1;
            case "5m":
                return 5;
            case "30m":
                return 30;
            default:
                return 1440;
        }
    }

    async wsOHLCV(timeframe:string, symbol:string, client:WebSocket){
        const tradingPairName = symbol.replace("_", "-").toLocaleUpperCase()
        const ws = new WebSocket("wss://wsapi.gopax.co.kr");
        ws.onopen = () =>{
            ws.send(JSON.stringify({

                n : "SubscribeToTradingPair",
                o: { tradingPairName},

            }))
        }

        ws.onmessage =(message) =>{
            const exchange = "gopax"
            const ticker = symbol
            if (typeof message.data === "string") {
                const data = JSON.parse(message.data)
                const result = data.o;
                if(data == -1){

                    const kline = [(result.t)*1000, result.o, result.h, result.l, result.c, result.a]
                    client.send(JSON.stringify({exchange, ticker, timeframe, kline }));
                }


            }
        }

        client.on('close', function close() {
            ws.close();
        });

    }

}