FROM node:18-bullseye

ENV NODE_ENV=production

WORKDIR /app

RUN npm install -g pm2

COPY .env-docker ./.env

COPY ecosystem.config.js-sample ./ecosystem.config.js

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir ./public/result

EXPOSE 3001

CMD [ "pm2-runtime" , "start", "ecosystem.config.js" ]