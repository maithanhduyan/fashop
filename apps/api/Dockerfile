# Build stage
FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY apps/api/go.mod apps/api/go.sum ./
RUN go mod download

COPY ./apps/api .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/server/

# Runtime stage
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata postgresql-client

WORKDIR /app
COPY --from=builder /app/server .
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/seeds ./seeds
COPY --from=builder /app/entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8080

CMD ["./entrypoint.sh"]
