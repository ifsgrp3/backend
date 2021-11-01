FROM node:14-alpine as base

WORKDIR /src
COPY package*.json ./
EXPOSE 3000

FROM ubuntu
RUN mkdir pong
WORKDIR /pong
RUN apt-get update 
RUN apt-get install python3 -y
RUN apt-get install python3-pip -y
COPY . /pong

RUN pip3 install adafruit_circuitpython_ble
RUN pip3 install pycryptodome

FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . ./
CMD ["npm", "start"]