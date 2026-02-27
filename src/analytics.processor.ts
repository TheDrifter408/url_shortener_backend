import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UAParser } from 'ua-parser-js';
import { PrismaService } from './prisma/prisma.service';
import { AnalyticsJobData } from './interfaces/analytics.interface';
import { Clicks } from '@prisma/client';

@Processor('analytics')
export class AnalyticsProcessor extends WorkerHost {
  constructor(private prismaService: PrismaService) {
    super();
  }

  async process(job: Job<AnalyticsJobData>): Promise<Clicks> {
    const { urlId, userAgent, referer, ip } = job.data;

    // Parse the User Agent string into clean columns
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();

    // save to the Clicks Table
    return await this.prismaService.clicks.create({
      data: {
        url_id: urlId,
        referer: referer || 'direct',
        device: uaResult.device.type || 'desktop',
        browser: uaResult.browser.name || 'unknown',
        os: uaResult.os.name || 'unknown',
        ip: ip,
      }
    })

  }
}