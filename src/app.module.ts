import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlshortenerModule } from './urlshortener/urlshortener.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformResponseInterceptor } from './interceptors/transformResponse.interceptor';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [UrlshortenerModule],
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
