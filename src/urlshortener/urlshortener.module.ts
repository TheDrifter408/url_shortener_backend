import { Module } from '@nestjs/common';
import { UrlShortenerController } from './urshortener.controller';
import { UrlShortenerService } from './urlshortener.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UrlShortenerController],
  providers: [UrlShortenerService, PrismaService]
})
export class UrlshortenerModule {}
