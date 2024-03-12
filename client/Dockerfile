FROM node:21.6.0-alpine3.19

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

EXPOSE 1403

CMD [ "npm", "run", "serve" ]