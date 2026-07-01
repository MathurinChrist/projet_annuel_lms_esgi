FROM node:20-alpine AS base
WORKDIR /src

FROM base AS dev
COPY package*.json ./
COPY prisma ./prisma
RUN npm install && npx prisma generate
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=3000
CMD ["npm", "run", "dev"]

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
