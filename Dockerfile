FROM node:18 as builder

WORKDIR /app

# required to run yarn to instsall dependencies
COPY package.json yarn.lock tsconfig.base.json ./
COPY scripts/ ./scripts
COPY linting/ ./linting
COPY src/app/package.json src/app/tsconfig.json ./src/app/ 
COPY src/site/pages/landing/package.json src/site/pages/landing/tsconfig.json ./src/site/pages/landing/
COPY src/site/pages/digital/package.json src/site/pages/digital/tsconfig.json ./src/site/pages/digital/
COPY src/site/pages/analog/package.json src/site/pages/analog/tsconfig.json ./src/site/pages/analog/
COPY src/site/pages/docs/package.json ./src/site/pages/docs/
COPY src/site/shared/package.json src/site/shared/tsconfig.json ./src/site/shared/
RUN yarn

# copy real source code 
COPY src/ ./src
RUN yarn run build:prod

FROM golang:latest as server_builder

WORKDIR /app
COPY --from=builder /app/build /app
RUN go build -o /opencircuit 

# actual container
FROM ubuntu:latest 

WORKDIR /app
COPY --from=server_builder /opencircuit /app/opencircuit
COPY --from=server_builder /app/site /app/site
COPY --from=server_builder /app/data /app/data

ENTRYPOINT ["/app/opencircuit", "--sqlitePath", "/app/data/sql/sqlite/"] 
