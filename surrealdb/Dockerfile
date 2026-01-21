FROM golang:1.23-alpine

RUN apk add --no-cache git

WORKDIR /go/bin
COPY . .

RUN go install github.com/JohnKinyanjui/surrealgo_migrate@latest 

CMD surrealgo_migrate migrate up --path migrations --host $SURREAL_HOST --db $SURREAL_DB --ns $SURREAL_NS --user $SURREAL_USER --pass $SURREAL_PASS