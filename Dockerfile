# Dockerfile

# Use official Golang v1.12 image
FROM golang:1.12

EXPOSE 8080

# Create work directory
WORKDIR /go/src/github.com/OpenCircuits/OpenCircuits

# Copy repo to work directory
COPY . .

# Avoid error
RUN sed -i "s/^exit 101$/exit 0/" /usr/sbin/policy-rc.d

# Install dependencies
RUN apt-get update && apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash
RUN apt-get install -y nodejs
RUN go get -u github.com/gin-gonic/gin

RUN npm install
RUN npm run build
RUN npm run build:go

# Change work directory for running php
#WORKDIR /www/build

# Command to run at start of container
CMD npm start
