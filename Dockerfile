FROM node:23.11.0-bullseye-slim

RUN apt-get update && apt-get install -y \
    imagemagick \
    zip \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run prisma:generate

RUN npm run build

RUN mkdir -p /app/volumes/application.kashiwa

RUN chown -R node:node /app/volumes/application.kashiwa

CMD ["npm", "run", "start:docker"]

EXPOSE 3000
