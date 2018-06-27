FROM node:10
WORKDIR /usr/src/app

COPY ./entry_svc/*.js ./entry_svc/package.json ./entry_svc/
COPY ./logging/*.js ./logging/package.json ./logging/
COPY ./ai_setup/*.js ./ai_setup/package.json ./ai_setup/

WORKDIR /usr/src/app/entry_svc
RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]