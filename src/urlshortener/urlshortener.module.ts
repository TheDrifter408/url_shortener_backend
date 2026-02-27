import { Module } from '@nestjs/common';
import { UrlShortenerController } from './urlshortener.controller';
import { UrlShortenerService } from './urlshortener.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BullModule } from '@nestjs/bullmq';
import { AnalyticsProcessor } from 'src/analytics.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analytics',
    })
  ],
  controllers: [UrlShortenerController],
  providers: [UrlShortenerService, PrismaService, AnalyticsProcessor]
})
export class UrlshortenerModule { }
