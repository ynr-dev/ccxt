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

    async fetchOHLCV(symbol: string, timeframe: string, since: number, period: number):Promise<Array<any>>{
        // const strArr = symbols.split(',');
        const interval = this.getInterval(timeframe);
        const axios = require('axios');
        const response = await axios.get('https://api.gopax.co.kr/trading-pairs/'+symbol.replace("_", "-").toLocaleUpperCase()+'/candles?start='+period+'&end='+since+'&interval='+interval);
        const data = response.data;

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

        const timeframes = ['1m','5m', '15m','30m','1h','1d'];
        return {scale, timeframes};
    }

    getInterval(timeframe: string): number{
        switch (timeframe) {

            case "1m":
                return 1;
            case "5m":
            case "15m":
                return 5;
            case "30m":
            case "1h":
                return 30;
            default:
                return 1440;
        }
    }

    async wsOHLCV(timeframe:string, symbol:string, client:WebSocket){
        const tradingPairName = symbol.replace("/", "-").toLocaleUpperCase()
        const ws = new WebSocket("wss://wsapi.gopax.co.kr");

        let time: number;
        let open: number;
        let high: number;
        let low: number;
        let volume: number;
        let result;
        let standardDate = new Date();
        let m
        switch (timeframe){
            case "1m":
                standardDate.setSeconds(0, 0);
                result = await this.fetchOHLCV(tradingPairName, "1m", new Date().getTime(), standardDate.getTime());
                if(result.length != 0){
                    time = result[result.length-1][0]
                    open = result[ result.length-1][1]
                    high = result[ result.length-1][2]
                    low = result[result.length-1][3]
                    volume = result[result.length-1][4]
                }else{
                    let dt = new Date();
                    dt.setSeconds(0 ,0)
                    time = dt.getTime()
                    open = 0
                    high = 0
                    low = 0
                    volume = 0
                }
                break

            case "5m":
                m = standardDate.getMinutes();
                if(m => 5){
                    m = 5
                }else{
                    m = 0
                }

                standardDate.setMinutes(m , 0 , 0);
                result = await this.fetchOHLCV(tradingPairName, "1m", new Date().getTime(), standardDate.getTime());
                if(result.length != 0){
                    time = result[result.length-1][0]
                    open = result[result.length-1][1]
                    high = result[result.length-1][2]
                    low = result[result.length-1][3]
                    volume = result[result.length-1][4]
                }else{
                    let dt = new Date();
                    dt.setMinutes(m,0 ,0)
                    time = dt.getTime()
                    open = 0
                    high = 0
                    low = 0
                    volume = 0
                }
                break
            case "15m":

                m = standardDate.getMinutes()
                if(m => 45){
                    m = 45
                }else if (m => 30){
                    m = 30
                }else if (m => 15){
                    m = 15
                }else {
                    m = 0
                }
                standardDate.setMinutes(m , 0 , 0)
                result = await this.fetchOHLCV(tradingPairName, "1m", new Date().getTime(), standardDate.getTime());
                if(result.length != 0){
                    time = result[result.length-1][0]
                    open = result[0][1]
                    high = this.findMaxInSecondColumn(result, 2)
                    low = this.findMinInSecondColumn(result, 3)
                    volume = this.findVolInSecondColumn(result, 4)
                }else{
                    let dt = new Date();
                    dt.setMinutes(m,0 ,0)
                    time = dt.getTime()
                    open = 0
                    high = 0
                    low = 0
                    volume = 0
                }
                break
            case "30m":

                m = standardDate.getMinutes()
                if(m => 30){
                    m = 30
                }else{
                    m = 0
                }
                standardDate.setMinutes(m , 0 , 0)
                result =await this.fetchOHLCV(tradingPairName, "1m", new Date().getTime(), standardDate.getTime());
                if(result.length != 0){
                    time = result[result.length-1][0]
                    open = result[result.length-1][1]
                    high = result[result.length-1][2]
                    low = result[result.length-1][3]
                    volume = result[result.length-1][4]
                }else{
                    let dt = new Date();
                    dt.setMinutes(m,0 ,0)
                    time = dt.getTime()
                    open = 0
                    high = 0
                    low = 0
                    volume = 0
                }
                break
            case "1h":

                standardDate.setMinutes(0 , 0 , 0);
                result = await this.fetchOHLCV(tradingPairName, "1m", new Date().getTime(), standardDate.getTime());
                if(result.length != 0){
                    time = result[result.length-1][0]
                    open = result[result.length-1][1]
                    high = result[result.length-1][2]
                    low = result[result.length-1][3]
                    volume = result[result.length-1][4]
                }else{
                    let dt = new Date();
                    dt.setMinutes(0,0 ,0)
                    time = dt.getTime()
                    open = 0
                    high = 0
                    low = 0
                    volume = 0
                }
                break
            case "1d":
                standardDate.setHours(0 , 0 , 0, 0)
                result = await this.fetchOHLCV(tradingPairName, "5m", new Date().getTime(), standardDate.getTime());
                if(result.length != 0){
                    time = result[result.length-1][0]
                    open = result[result.length-1][1]
                    high = result[result.length-1][2]
                    low = result[result.length-1][3]
                    volume = result[result.length-1][4]
                }else{
                    let dt = new Date();
                    dt.setHours(0,0 ,0,0)
                    time = dt.getTime()
                    open = 0
                    high = 0
                    low = 0
                    volume = 0
                }
                break

            default :
                break
        }

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
                if(data.i == -1 && data.n == 'PublicTradeEvent'){

                    let date = new Date(result.occurredAt);
                    switch (timeframe){
                        case "1m":
                            date.setSeconds(0, 0);
                            if(date.getTime() > time){
                                time = date.getTime()
                                open = result.price
                                high = result.price
                                low = result.price
                                volume = result.baseAmount
                            }else{
                                open = open == 0 ? result.price : open
                                high = high == 0 || high < result.price ? result.price : high
                                low = low == 0 || low > result.price ? result.price : high
                                volume += result.baseAmount
                            }

                            break

                        case "5m":

                            m = standardDate.getMinutes()
                            if(m => 5){
                                m = 5
                            }else{
                                m = 0
                            }
                            date.setMinutes(m,0, 0);
                            if(date.getTime() > time){
                                time = date.getTime()
                                open = result.price
                                high = result.price
                                low = result.price
                                volume = result.baseAmount
                            }else{
                                open = open == 0 ? result.price : open
                                high = high == 0 || high < result.price ? result.price : high
                                low = low == 0 || low > result.price ? result.price : high
                                volume += result.baseAmount
                            }
                            break
                        case "15m":
                            m = standardDate.getMinutes()
                            if(m => 45){
                                m = 45
                            }else if (m => 30){
                                m = 30
                            }else if (m => 15){
                                m = 15
                            }else {
                                m = 0
                            }
                            date.setMinutes(m,0, 0);
                            if(date.getTime() > time){
                                time = date.getTime()
                                open = result.price
                                high = result.price
                                low = result.price
                                volume = result.baseAmount
                            }else{
                                open = open == 0 ? result.price : open
                                high = high == 0 || high < result.price ? result.price : high
                                low = low == 0 || low > result.price ? result.price : high
                                volume += result.baseAmount
                            }
                            break
                        case "30m":
                            m = standardDate.getMinutes()
                            if(m => 30){
                                m = 30
                            }else{
                                m = 0
                            }
                            date.setMinutes(m,0, 0);
                            if(date.getTime() > time){
                                time = date.getTime()
                                open = result.price
                                high = result.price
                                low = result.price
                                volume = result.baseAmount
                            }else{
                                open = open == 0 ? result.price : open
                                high = high == 0 || high < result.price ? result.price : high
                                low = low == 0 || low > result.price ? result.price : high
                                volume += result.baseAmount
                            }
                            break
                        case "1h":
                            date.setMinutes(0 , 0 , 0)
                            if(date.getTime() > time){
                                time = date.getTime()
                                open = result.price
                                high = result.price
                                low = result.price
                                volume = result.baseAmount
                            }else{
                                open = open == 0 ? result.price : open
                                high = high == 0 || high < result.price ? result.price : high
                                low = low == 0 || low > result.price ? result.price : high
                                volume += result.baseAmount
                            }
                            break
                        case "1d":
                            date.setHours(0 , 0 , 0)
                            if(date.getTime() > time){
                                time = date.getTime()
                                open = result.price
                                high = result.price
                                low = result.price
                                volume = result.baseAmount
                            }else{
                                open = open == 0 ? result.price : open
                                high = high == 0 || high < result.price ? result.price : high
                                low = low == 0 || low > result.price ? result.price : high
                                volume += result.baseAmount
                            }
                            break
                        default :
                            break
                    }


                    const kline = [time, open, high, low, result.price, volume]
                    client.send(JSON.stringify({exchange, ticker, timeframe, kline }));
                }


            }
        }

        client.on('close', function close() {
            ws.close();
        });

    }

    findMaxInSecondColumn(arr: number[][], n : number): number {
        let max = Number.NEGATIVE_INFINITY;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i][n] > max) {
                max = arr[i][1];
            }
        }

        return max;
    }

    findMinInSecondColumn(arr: number[][], n : number): number {
        let min = Number.POSITIVE_INFINITY;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i][n] < min) {
                min = arr[i][1];
            }
        }

        return min;
    }

    findVolInSecondColumn(arr: number[][], n : number): number {
        let vol = 0;

        for (let i = 0; i < arr.length; i++) {

                vol += arr[i][1];

        }

        return vol;
    }

}