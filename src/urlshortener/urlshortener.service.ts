import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SlugGenerator } from "./slugGenerator";
import { CreateUrlDto } from "./dto/createUrl.dto";
import { User } from "@prisma/client";
import { RequestUser } from 'src/auth/types/JwtPayload';

@Injectable()
export class UrlShortenerService {
  constructor(
    private prismaService: PrismaService,
  ) { }

  async getOverview(user: Pick<User, "id" | "email">) {
    const userId = user.id;

    const [urlStats, clickCount, topLink, devices, browsers] = await Promise.all([
      // Total number of links
      this.prismaService.uRL.count({
        where: {
          user_id: userId
        }
      }),
      // Total number of clicks across all links
      this.prismaService.clicks.count({
        where: {
          url: {
            user_id: userId
          }
        }
      }),
      // Find the link with the most clicks
      this.prismaService.uRL.findFirst({
        where: { user_id: userId },
        orderBy: {
          clicks: {
            _count: 'desc'
          }
        },
        select: {
          slug: true,
          long_url: true,
          _count: {
            select: {
              clicks: true
            }
          }
        }
      }),
      // Device Distribution
      this.prismaService.clicks.groupBy({
        by: ['device'],
        where: {
          url: { user_id: userId },
        },
        _count: {
          _all: true,
        }
      }),
      // Browser Distribution
      this.prismaService.clicks.groupBy({
        by: ['browser'],
        where: {
          url: { user_id: userId },
        },
        _count: {
          _all: true,
        }
      })

    ]);

    return {
      total_links: urlStats,
      total_clicks: clickCount,
      top_performer: topLink ? {
        slug: topLink.slug,
        clicks: topLink._count.clicks,
        url: topLink.long_url
      } : null,
      distributions: {
        devices: {
          total: devices.reduce((acc, curr) => acc + curr._count._all, 0),
          list: devices.map((d) => ({ label: d.device, count: d._count._all }))
        },
        browsers: {
          total: browsers.reduce((acc, curr) => acc + curr._count._all, 0),
          list: browsers.map((b) => ({ label: b.browser, count: b._count._all }))
        }
      }
    }
  }

  async getAllUrls(user: Pick<User, "id" | "email">) {
    const urls = await this.prismaService.uRL.findMany({
      where: {
        user_id: user.id
      }
    });
    return urls;
  }

  async getOriginalUrl(slug: string) {
    const found = await this.prismaService.uRL.findUnique({
      where: {
        slug,
      }
    });
    return found;
  }

  async create(payload: CreateUrlDto, user: Pick<User, "id" | "email"> | null) {
    const found = await this.prismaService.uRL.findFirst({
      where: {
        long_url: payload.payload,
        user_id: user?.id || null,
      }
    });
    if (found) {
      return {
        slug: found.slug,
        short_url: `${process.env.BASE_URL}/${found.slug}`,
        long_url: found.long_url,
      };
    }

    let slug = "";

    let unique = false;

    while (!unique) {

      const generated = SlugGenerator.generateSlug(6);
      //1. Check to see if the generated URL exists in the database
      const exists = await this.prismaService.uRL.findUnique({
        where: {
          slug: generated,
        }
      });

      if (!exists) {
        slug = generated;
        unique = true;
      }
    }

    //2. If it doesn't exist create an entry in the database
    await this.prismaService.uRL.create({
      data: {
        long_url: payload.payload,
        slug,
        user_id: user?.id,
      }
    });

    return {
      slug,
      short_url: `${process.env.BASE_URL}/${slug}`,
      original_url: payload.payload,
    }
  }

  async getAnalytics(slug: string, user: RequestUser) {
    const url = await this.prismaService.uRL.findUnique({
      where: {
        slug,
      },
      include: {
        _count: { select: { clicks: true } },
      }
    });

    if (!url) throw new NotFoundException('URL not found');

    if (url.user_id !== user?.id) {
      throw new ForbiddenException('You do not have permission to view this URL\'s anaytics');
    }

    const [browsers, devices, os] = await Promise.all([
      this.prismaService.clicks.groupBy({
        by: ['browser'],
        where: { url_id: url.id },
        _count: true,
      }),
      this.prismaService.clicks.groupBy({
        by: ['device'],
        where: { url_id: url.id },
        _count: true,
      }),
      this.prismaService.clicks.groupBy({
        by: ['os'],
        where: { url_id: url.id },
        _count: true,
      })
    ]);

    return {
      total_clicks: url._count.clicks,
      long_url: url.long_url,
      breakdown: {
        browsers,
        devices,
        os,
      }
    }
  }

}