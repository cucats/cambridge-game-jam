FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
RUN bun run build

EXPOSE 3000
CMD ["bun", "./build"]
