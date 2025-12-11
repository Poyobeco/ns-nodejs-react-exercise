FROM node:22-alpine

RUN apk add --no-cache curl bash

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN chmod +x seed.sh tests.sh lint.sh

EXPOSE 8000

CMD ["npm", "start"]
