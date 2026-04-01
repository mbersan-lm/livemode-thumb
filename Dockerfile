# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20
WORKDIR /app

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY --from=builder /app/node_modules ./node_modules

RUN mkdir -p /ms-playwright \
  && ./node_modules/.bin/playwright install --with-deps chromium \
  && chmod -R a+rx /ms-playwright

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server.js ./

ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
