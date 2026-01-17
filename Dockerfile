FROM golang:1.25.0-alpine

RUN apk add --update nodejs npm

WORKDIR /app

COPY ./server/go.mod .
COPY ./server/go.sum .

RUN go mod download

COPY ./server .

ENV GOCACHE=/root/.cache/go-build

RUN --mount=type=cache,target="/root/.cache/go-build" go build -o app.o

WORKDIR /app/frontend
COPY ./client/package*.json ./
RUN npm install
COPY ./client .
RUN npm run build

WORKDIR /app

CMD [ "/app/app.o" ]