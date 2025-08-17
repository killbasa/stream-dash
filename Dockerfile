## Base ##
FROM node:24.6.0-alpine3.22 AS base

RUN apk update --no-cache

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
COPY --from=builder /temp/package.json ./

CMD ["node", "--enable-source-maps", "build/index.js"]
