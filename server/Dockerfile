FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .
RUN mkdir -p data

EXPOSE 3000
ENV PORT=3000
CMD ["bun", "run", "start"]
