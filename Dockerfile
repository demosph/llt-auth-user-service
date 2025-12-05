FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY src ./src
COPY .env ./
EXPOSE 3000

CMD ["npm","start"]