## Base ##
FROM node:24.7.0-bookworm-slim AS base

RUN apt update && \
	apt install -y openssl

## Builder ##
FROM base AS builder

WORKDIR /temp

COPY ./static static/
COPY .yarn .yarn/
COPY prisma prisma/
COPY .yarnrc.yml tsconfig.json yarn.lock package.json prisma.config.ts vite.config.ts svelte.config.js ./
COPY src/ src/

RUN yarn install --immutable && \
	yarn sync && \
	yarn db:generate && \
	yarn build && \
	yarn workspaces focus --production

## App ##
FROM base AS app

ENV NODE_ENV=production

COPY --from=builder /temp/static static/
COPY --from=builder /temp/node_modules node_modules/
COPY --from=builder /temp/build build/
COPY --from=builder /temp/src/lib/server/db/generated/libquery_engine-debian-openssl-3.0.x.so.node build/server/chunks/
COPY --from=builder /temp/package.json ./

CMD ["node", "--enable-source-maps", "build/index.js"]
