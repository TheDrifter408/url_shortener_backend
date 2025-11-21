import { Module } from '@nestjs/common';
import { UrlShortenerController } from './urshortener.controller';
import { UrlShortenerService } from './urlshortener.service';

@Module({
  controllers: [UrlShortenerController],
  providers: [UrlShortenerService]
})
export class UrlshortenerModule {}
