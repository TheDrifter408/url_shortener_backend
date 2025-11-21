import { Controller, Get, HttpException, HttpStatus, Post, Req } from "@nestjs/common";
import  type { Request } from "express";
import { UrlShortenerService } from "./urlshortener.service";

@Controller('urlshortener')
export class UrlShortenerController {
  private urlShortenerService: UrlShortenerService;
  constructor(urlShortenerService: UrlShortenerService) {
    this.urlShortenerService = urlShortenerService;
  }
  @Get()
  getAllUrls() {
    return this.urlShortenerService.getAllUrls();
  }

  @Post()
  shortenUrl(@Req() request: Request) {
    const body = request.body;
    return this.urlShortenerService.shortenUrl(body);
  }

}