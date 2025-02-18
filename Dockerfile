FROM node:18-alpine3.20

ENV NODE_ENV=production

WORKDIR /app

COPY .env-docker ./.env

COPY ecosystem.config.js-sample ./ecosystem.config.js

COPY package*.json ./

RUN npm install && npm install -g pm2

COPY . .

RUN mkdir ./public/result

EXPOSE 3001

CMD [ "pm2-runtime" , "start", "ecosystem.config.js" ]