FROM node:16-alpine

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

RUN npm run build

EXPOSE 3000

CMD [ "node", "dist/index.js" ]