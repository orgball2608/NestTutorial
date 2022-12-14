import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { TypeormStore } from 'connect-typeorm/out';
import { Session } from './utils/typeorm';
import * as session from 'express-session';
import * as passport from 'passport';
import { getRepository } from 'typeorm';
import { WebsocketAdapter } from './gateway/gateway.adapter';

async function bootstrap() {
    const PORT = process.env.PORT || 3001;
    const app = await NestFactory.create(AppModule);
    const sessionRepository = getRepository(Session);
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors({ origin: ['http://localhost:3000'], credentials: true });
    const adapter = new WebsocketAdapter(app);
    app.useWebSocketAdapter(adapter);
    app.setGlobalPrefix('api');
    app.use(
        session({
            secret: process.env.COOKIE_SECRET,
            resave: false,
            name: 'CHAT_APP_SESSION_ID',
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
            },
            store: new TypeormStore().connect(sessionRepository),
        }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
bootstrap();
