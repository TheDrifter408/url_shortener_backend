import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Redirect, Req, SetMetadata } from "@nestjs/common";
import  type { Request } from "express";
import { UrlShortenerService } from "./urlshortener.service";
import { CreateUrlDto } from "./dto/createUrl.dto";
import { SKIP_RESPONSE_TRANSFORM } from "src/interceptors/intercepter.constants";

@Controller('minurl')
export class UrlShortenerController {
  private urlShortenerService: UrlShortenerService;
  constructor(urlShortenerService: UrlShortenerService) {
    this.urlShortenerService = urlShortenerService;
  }
  @Get()
  getAllUrls() {
    return this.urlShortenerService.getAllUrls();
  }

  @SetMetadata(SKIP_RESPONSE_TRANSFORM, true)
  @Get(':slug')
  @Redirect()
  async redirectToOriginalUrl(@Param('slug') slug:string) {

    if (!slug) {
      throw new HttpException("No Slug sent", HttpStatus.BAD_REQUEST);
    }

    const originalUrl = await this.urlShortenerService.getOriginalUrl(slug);

    if (!originalUrl) {
      throw new HttpException("Short URL not found", HttpStatus.NOT_FOUND);
    }

    return {
      url: originalUrl.long_url,
      statusCode: 302,
    }
  }

  @Post()
  shortenUrl(@Body() body: CreateUrlDto) {
    return this.urlShortenerService.create(body);
  }

}