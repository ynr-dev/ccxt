import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import {CorsOptions} from "@nestjs/common/interfaces/external/cors-options.interface";

async function bootstrap() {
     const app = await NestFactory.create<NestFastifyApplication>(
       AppModule,
      new FastifyAdapter(),

    );
    const corsOptions: CorsOptions = {
        origin: 'http://localhost:3000', // 허용할 도메인을 여기에 설정
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    };
    app.enableCors(corsOptions);
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.listen(3000);
}
bootstrap();
