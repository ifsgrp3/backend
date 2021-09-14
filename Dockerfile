# syntax=docker/dockerfile:1

FROM node:10.19.0

ENV NODE_ENV=production
WORKDIR /app
COPY ["package-lock.json*", "./"]
RUN npm install --production
COPY . .
CMD [ "node", "app.js"]