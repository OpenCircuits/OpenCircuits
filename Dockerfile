############################
# STEP 1 build executable binary
############################
FROM golang:1.13-alpine AS builder

# Install git and gcc
# Git is required for fetching the dependencies.
# GCC is required for sqlite3
RUN apk add --no-cache git build-base

WORKDIR /go/src/github.com/OpenCircuits/OpenCircuits/site/go

# Copy go.mod to get go modules
COPY ./site/go/go.mod .

# Install dependencies
RUN go mod download

# Copy the rest of the project to build
COPY ./site/go/ .

# Build the binary.
RUN go build -o /go/bin/server .


############################
# STEP 2 build a node image
############################
FROM node:8-alpine AS runner

EXPOSE 80

# Install git.
# Git is required for fetching the dependencies.
RUN apk add --no-cache git

WORKDIR /go/src/github.com/OpenCircuits/OpenCircuits/

# Copy package.json to install node packages
COPY package.json .

# Install dependencies
RUN npm install

# Copy the rest of the project to build
COPY . .

# Build the rest of the project
RUN npm run build && \
    npm run build:css


# Copy our static executable.
COPY --from=builder /go/bin/server ./build/server

# Command to run at start of container
CMD cd ./build && ./server --port=80
