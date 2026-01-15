FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY src ./src
COPY public ./public

EXPOSE 3001

CMD ["npm","start"]