import {Injectable} from "@nestjs/common";
import {WebSocket} from "ws";

@Injectable()
export class GateioService {


    async wsOHLCV(timeframe:string, symbol:string, client:WebSocket){
        const coin = symbol.replace("/", "_")

        const ws = new WebSocket("wss://api.gateio.ws/ws/v4/");
        ws.onopen = () =>{
            ws.send(JSON.stringify({
                time:1,
                channel: "spot.candlesticks",
                event: "subscribe",
                payload: [timeframe, coin]
            }))
        }

        ws.onmessage =(message) =>{
            const exchange = "gateio"
            const ticker = symbol
            if (typeof message.data === "string") {
                const kline = [JSON.parse(message.data)]
                client.send(JSON.stringify({exchange, ticker, timeframe, kline }));
            }

        }
    }
}