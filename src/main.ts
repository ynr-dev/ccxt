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
        origin: '*', // 프론트엔드 앱의 도메인을 지정
        credentials: true, // 인증 정보 (쿠키 등)를 포함할 경우 true로 설정
    };
    app.enableCors(corsOptions);
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.listen(3000);
}
bootstrap();
