FROM node:carbon
WORKDIR /usr/src/app

COPY ./expected_date_svc/*.js ./expected_date_svc/package.json ./expected_date_svc/
COPY ./logging/*.js ./logging/package.json ./logging/

WORKDIR /usr/src/app/expected_date_svc
RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]