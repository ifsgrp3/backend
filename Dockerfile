FROM node:14-alpine as base

WORKDIR /src
COPY package*.json ./
EXPOSE 8000

# FROM ubuntu
# ENV DEBIAN_FRONTEND noninteractive
# RUN docker run -it ubuntu bash
# RUN apt-get update --allow-insecure-repositories --allow-unauthenticated
# RUN apt autoremove
# RUN apt-get clean
# RUN apt-get install gcc
# RUN mkdir pong
# WORKDIR /pong

# FROM golang:alpine
# RUN apk add build-base

# RUN apt-get update || : && apt-get install python3 -y
# RUN apt-get -y install python3
# RUN apt-get -y install python3-pip
# COPY . /pong

# RUN python -m pip install --upgrade pip
# RUN pip3 install adafruit_circuitpython_ble


FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . ./
CMD ["npm", "start"]
