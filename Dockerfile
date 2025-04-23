FROM node:23.11.0-bullseye-slim

RUN apt-get update && apt-get install -y \
    imagemagick \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run prisma:generate

RUN npm run build

USER node

CMD ["npm", "run", "start:docker"]

EXPOSE 3000
