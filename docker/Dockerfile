# 1: Build this image
# docker build -t uitpas-ng ./docker/Dockerfile
# 2: Run npm commands inside container
# docker run -it --rm -p 80:9999 -v $(pwd):/data uitpas-ng npm run serve
FROM node:8

RUN apt-get update && \
    apt-get install -y ruby-full&& \
    gem install compass

WORKDIR /data
