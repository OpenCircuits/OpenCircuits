#!/bin/bash

set -e

docker build -t ngspice:make .
docker run --rm -v $(pwd):/mnt ngspice:make

cp ./build/* ../NGSpiceTest/src/lib/
