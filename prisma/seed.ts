import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../src/constants';
import { PrismaPg } from '@prisma/adapter-pg';

import * as path from 'path';
import * as dotenv from 'dotenv';

// Force load the .env from the project root
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Connection string (DIRECT_URL or DATABASE_URL) is undefined. Check your .env file path.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning database....');
  await prisma.clicks.deleteMany();
  await prisma.uRL.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.user.deleteMany();

  const noOfUsers = 100;

  console.log(`Seeding ${noOfUsers} users: `);

  const commonPassword = 'password123';

  const commonPasswordHash = await bcrypt.hash(commonPassword, BCRYPT_SALT_ROUNDS);

  const users = await Promise.all(
    Array.from({ length: noOfUsers }).map(() =>
      prisma.user.create({
        data: {
          email: faker.internet.email(),
          password_hash: commonPasswordHash,
          subscription_level: faker.helpers.arrayElement(['free', 'pro', 'enterprise']),
          hashed_refresh_token: faker.string.uuid(),
        }
      })
    )
  );

  console.log('Seeding domains....');

  const domains = await Promise.all(
    users.slice(0, 50).map((user) =>
      prisma.domain.create({
        data: {
          domain_name: faker.internet.domainName(),
          user_id: user.id,
        }
      })
    )
  );

  console.log('Seeding URLs.....');

  const urls = await Promise.all(
    Array.from({ length: noOfUsers }).map(() => {
      const user = faker.helpers.arrayElement(users);
      const domain = faker.helpers.maybe(() => faker.helpers.arrayElement(domains), { probability: 0.7 });

      return prisma.uRL.create({
        data: {
          slug: faker.string.alphanumeric(6),
          long_url: faker.internet.url(),
          user_id: user.id,
          domain_id: domain ? domain.id : null,
        }
      })
    })
  );

  console.log(`Seeding ${noOfUsers} Clicks....`);

  await Promise.all(
    Array.from({ length: noOfUsers }).map(() =>
      prisma.clicks.create({
        data: {
          url_id: faker.helpers.arrayElement(urls).id,
          referer: faker.internet.url(),
          device: faker.helpers.arrayElement(['Mobile', 'Desktop', 'Tablet']),
          browser: faker.helpers.arrayElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
          os: faker.helpers.arrayElement(['iOS', 'Android', 'macOS', 'Windows', 'Linux']),
          ip: faker.internet.ipv4(),
          timestamp: faker.date.recent({ days: 30 }),
        }
      })
    )
  )

  console.log('Seeding Complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });