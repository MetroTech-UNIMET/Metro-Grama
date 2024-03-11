FROM golang:1.22-alpine3.19

WORKDIR /app

COPY . .

RUN go mod download
RUN go mod tidy
RUN go build -o /app/build.o main.go

CMD [ "/app/build.o" ]