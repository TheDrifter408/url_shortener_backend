import { Injectable } from "@nestjs/common";

@Injectable()
export class UrlShortenerService {
  async getAllUrls() {
    return 'All urls';
  }

  async shortenUrl(originalUrl: string) {
    return `This ${originalUrl} is gonna be shortened to XYZ`;
  }
}