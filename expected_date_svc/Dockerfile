FROM node:10
WORKDIR /usr/src/app

COPY ./expected_date_svc/*.js ./expected_date_svc/package.json ./expected_date_svc/
COPY ./logging/*.js ./logging/package.json ./logging/
COPY ./ai_setup/*.js ./ai_setup/package.json ./ai_setup/

WORKDIR /usr/src/app/expected_date_svc
RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]