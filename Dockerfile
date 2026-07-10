FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY apps ./apps
COPY packages ./packages
COPY scripts ./scripts
COPY docs ./docs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node scripts/deployment-check.js || exit 1

CMD ["node", "apps/api/src/server.js"]
