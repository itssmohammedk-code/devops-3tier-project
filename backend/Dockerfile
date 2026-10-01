FROM node:24-alpine

WORKDIR /app

RUN npm install -g npm@11 && npm cache clean --force

COPY package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node . .

EXPOSE 3000

USER node

CMD ["node", "server.js"]
