FROM node:20-alpine

WORKDIR /app

RUN npm install -g npm@11

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]