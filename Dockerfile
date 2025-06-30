FROM node:18 as builder

WORKDIR /app

# required to run yarn to instsall dependencies
COPY package.json yarn.lock tsconfig.base.json ./
COPY scripts/ ./scripts
COPY linting/ ./linting
COPY src/ ./src
RUN yarn
RUN yarn run build:prod

FROM golang:latest as server_builder

WORKDIR /app
COPY --from=builder /app/build /app
RUN go build -o /opencircuits 

# actual container
FROM ubuntu:latest 

WORKDIR /app
COPY --from=server_builder /opencircuits /app/opencircuits
COPY --from=server_builder /app/site /app/site
COPY --from=server_builder /app/data /app/data

ENTRYPOINT ["/app/opencircuits", "--sqlitePath", "/app/data/sql/sqlite/"] 
