FROM node:10
WORKDIR /usr/src/app

COPY ./auth_svc/*.js ./auth_svc/package.json ./auth_svc/
COPY ./logging/*.js ./logging/package.json ./logging/
COPY ./ai_setup/*.js ./ai_setup/package.json ./ai_setup/

WORKDIR /usr/src/app/auth_svc
RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]