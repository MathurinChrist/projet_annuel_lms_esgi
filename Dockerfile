FROM node:20-alpine AS base
WORKDIR /src
RUN npm install -g pnpm

FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate

# Étape de build
FROM deps AS build
COPY . .
RUN npm run build

FROM node:20-alpine AS final
WORKDIR /app

# Copie des fichiers nécessaires depuis l'étape de build
COPY --from=build /src/.output /app/.output
COPY --from=build /src/package.json /app/package.json
COPY --from=build /src/prisma /app/prisma
COPY --from=build /src/node_modules /app/node_modules

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
