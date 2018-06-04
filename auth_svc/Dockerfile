FROM node:carbon
WORKDIR /usr/src/app

COPY ./auth_svc/*.js ./auth_svc/package.json ./auth_svc/
COPY ./logging/*.js ./logging/package.json ./logging/

WORKDIR /usr/src/app/auth_svc
RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]