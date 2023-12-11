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
                const result = JSON.parse(message.data).result
                if(result.t != null){

                    const kline = [(result.t)*1000, result.o, result.h, result.l, result.c, result.v]
                    client.send(JSON.stringify({exchange, ticker, timeframe, kline }));
                }


            }
            console.log(exchange)
        }

        client.on('close', function close() {
           ws.close();
        });

    }
}