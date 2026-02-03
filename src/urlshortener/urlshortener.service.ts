import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SlugGenerator } from "./slugGenerator";
import { CreateUrlDto } from "./dto/createUrl.dto";
import { User } from "@prisma/client";

@Injectable()
export class UrlShortenerService {
  constructor(private prismaService: PrismaService) {}

  async getAllUrls() {
    return 'All urls';
  }

  async getOriginalUrl(slug: string) {
    const found = await this.prismaService.uRL.findFirst({
      where: {
        slug,
      }
    });
    return found;
  }
  async create(payload: CreateUrlDto, user: Pick<User, "id" | "email">) {
    const found = await this.prismaService.uRL.findFirst({
      where: {
        long_url: payload.payload,
      }
    });
    if (found) {
      return found.slug;
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
        user_id: user.id,
      }
    });

    return {
      slug,
      short_url: `${process.env.BASE_URL}/${slug}`,
      original_url: payload.payload,
    }
  }
}