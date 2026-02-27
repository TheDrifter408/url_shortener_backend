import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Redirect, Req, SetMetadata, UnauthorizedException, UseGuards } from "@nestjs/common";
import { UrlShortenerService } from "./urlshortener.service";
import { CreateUrlDto } from "./dto/createUrl.dto";
import { SKIP_RESPONSE_TRANSFORM } from "src/interceptors/intercepter.constants";
import { JwtAuthGuard } from "src/auth/guards/jwtAuth.guard";
import type { RequestUser } from "src/auth/types/JwtPayload";
import { GetUser } from "src/auth/decorators/get-user.decorator";

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Request } from 'express';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optionalJwtAuth.guard';

@Controller('minurl')
export class UrlShortenerController {
  private urlShortenerService: UrlShortenerService;
  constructor(
    urlShortenerService: UrlShortenerService,
    @InjectQueue('analytics') private analyticsQueue: Queue
  ) {
    this.urlShortenerService = urlShortenerService;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  getAllUrls(@GetUser() user: RequestUser) {
    return this.urlShortenerService.getAllUrls(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':slug/analytics')
  async getAnalytics(@Param('slug') slug: string, @GetUser() user: RequestUser) {
    return this.urlShortenerService.getAnalytics(slug, user);
  }

  @SetMetadata(SKIP_RESPONSE_TRANSFORM, true)
  @Get(':slug')
  @Redirect()
  async redirectToOriginalUrl(
    @Param('slug') slug: string,
    @Req() req: Request,
  ) {

    if (!slug) {
      throw new HttpException("No Slug sent", HttpStatus.BAD_REQUEST);
    }

    const originalUrl = await this.urlShortenerService.getOriginalUrl(slug);

    if (!originalUrl) {
      throw new HttpException("Short URL not found", HttpStatus.NOT_FOUND);
    }

    if (originalUrl.user_id) {
      this.analyticsQueue.add('log-click', {
        urlId: originalUrl.id,
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer'],
        ip: req.ip,
      })
    }


    return {
      url: originalUrl.long_url,
      statusCode: 302,
    }
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  shortenUrl(@Body() body: CreateUrlDto, @GetUser() user: RequestUser | null) {
    return this.urlShortenerService.create(body, user);
  }

}