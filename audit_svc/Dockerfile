FROM node:10
WORKDIR /usr/src/app

COPY ./audit_svc/*.js ./audit_svc/package.json ./audit_svc/
COPY ./logging/*.js ./logging/package.json ./logging/
COPY ./ai_setup/*.js ./ai_setup/package.json ./ai_setup/

WORKDIR /usr/src/app/audit_svc
RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]