FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

COPY package.json package-lock.json ./

RUN npm config delete proxy \
    && npm config delete https-proxy \
    && npm ci --omit=dev --registry=https://registry.npmjs.org/

COPY apps ./apps
COPY packages ./packages
COPY scripts ./scripts
COPY docs ./docs

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node scripts/deployment-check.js || exit 1

CMD ["node", "apps/api/src/server.js"]