FROM node:10
WORKDIR /usr/src/app

COPY ./entry_svc/*.js ./entry_svc/package.json ./entry_svc/
COPY ./logging/*.js ./logging/package.json ./logging/

WORKDIR /usr/src/app/entry_svc
RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]