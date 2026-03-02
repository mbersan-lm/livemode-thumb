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

# Install Playwright Chromium and its dependencies
RUN npx playwright install --with-deps chromium

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server.js ./

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
