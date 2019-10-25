############################
# STEP 1 build executable binary
############################
FROM golang:1.13-alpine AS builder

# Install git.
# Git is required for fetching the dependencies.
RUN apk update
RUN apk add git
RUN apk add build-base

WORKDIR /go/src/github.com/OpenCircuits/OpenCircuits/site/go
COPY ./site/go/ .

# Get dependencies
RUN go mod download

# Build the binary.
RUN go build -o /go/bin/server .


############################
# STEP 2 build a node image
############################
FROM node:8-alpine AS runner

EXPOSE 8080

# Install git.
# Git is required for fetching the dependencies.
RUN apk update
RUN apk add git

WORKDIR /go/src/github.com/OpenCircuits/OpenCircuits/
COPY . .

RUN npm install
RUN npm run build:js
RUN npm run build:css

# Copy our static executable.
COPY --from=builder /go/bin/server ./build/server

# Command to run at start of container
CMD cd ./build && ./server
