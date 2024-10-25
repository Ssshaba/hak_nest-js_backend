FROM node:20-buster-slim

WORKDIR /app

COPY package.json ./ 

COPY yarn.lock ./

RUN yarn install

RUN apt-get update -y && apt-get install -y openssl
RUN apt install -y chromium
COPY . .

COPY .env .

COPY  prisma ./prisma

COPY scripts.sh /scripts.sh
RUN chmod +x /scripts.sh

RUN yarn prisma generate

RUN yarn build

EXPOSE 3500

CMD ["/scripts.sh"]
