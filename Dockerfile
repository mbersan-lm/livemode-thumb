# Stage 1: Build the SPA
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production with Playwright
FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /app

# Copy built SPA and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Install Playwright browsers
RUN npx playwright install chromium

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/index.mjs"]
