FROM node:latest

WORKDIR /usr/src/app
COPY bill-com .
RUN npm install

EXPOSE 80

CMD ["node", "index.js"]




