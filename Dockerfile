# Dockerfile
FROM node:10.9.0 

WORKDIR /www

COPY .babelrc gulpfile.babel.js package.json package-lock.json /www/
COPY site /www/site
COPY tests /www/tests

RUN sed -i "s/^exit 101$/exit 0/" /usr/sbin/policy-rc.d

RUN ls 

RUN apt-get update && apt-get install -y php5 php5-sqlite
RUN npm install gulp-cli -g
RUN npm install gulp -D
RUN npm install
RUN gulp build
#RUN php -S localhost:8080 /www/site/public
