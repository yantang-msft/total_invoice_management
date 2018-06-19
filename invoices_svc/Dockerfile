FROM node:10
WORKDIR /usr/src/app

COPY ./invoices_svc/*.js ./invoices_svc/package.json ./invoices_svc/
COPY ./logging/*.js ./logging/package.json ./logging/

WORKDIR /usr/src/app/invoices_svc
RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]