import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Module Imports
import { UrlshortenerModule } from './urlshortener/urlshortener.module';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bullmq';
// Core and interceptor imports
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformResponseInterceptor } from './interceptors/transformResponse.interceptor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379
      }
    }),
    UrlshortenerModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor
    },
  ],
})
export class AppModule {}
