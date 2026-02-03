FROM node:20-alpine

# Install pnpm directly
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy lockfile and package.json first
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

Copy . .

EXPOSE 5000

# Use commands to run the app
CMD ["pnpm", "run", "dev"]