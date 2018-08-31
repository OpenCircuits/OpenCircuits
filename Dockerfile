# Dockerfile
FROM node:8.11.4

RUN sed -i "s/^exit 101$/exit 0/" /usr/sbin/policy-rc.d
RUN apt-get update && apt-get install -y php5 php5-sqlite
RUN npm install -g
RUN gulp build
RUN php -S localhost:8080 site/public
