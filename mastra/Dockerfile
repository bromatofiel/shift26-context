# ─── Builder ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app-mastra

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# ─── Runtime ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app-mastra

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# mastra CLI is a devDependency but required for `mastra start`
RUN npm install -g mastra@1.3.15

COPY --from=builder /app-mastra/.mastra ./.mastra

RUN mkdir -p /app-mastra/data && chown node:node /app-mastra/data

ENV NODE_ENV=production
EXPOSE 4111
VOLUME /app-mastra/data

USER node
CMD ["npm", "run", "start"]
