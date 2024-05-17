FROM node:14-alpine

WORKDIR /app

COPY package.json ./

COPY ./ ./

RUN npm install

CMD ["npm", "run", "dev"]

EXPOSE 8800
