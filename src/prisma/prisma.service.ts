import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import "dotenv/config";
import { env } from 'prisma/config';


@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = env("DIRECT_URL");
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }
}
