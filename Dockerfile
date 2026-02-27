FROM node:20-alpine AS base

WORKDIR /src

FROM base AS build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM base AS final
COPY --from=build /src/.output /src/.output
COPY --from=build /src/package.json /src/package.json

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]
