FROM node:lts

WORKDIR /app
COPY . ./
RUN yarn && yarn build

EXPOSE 8081
CMD [ "node", "server.js", "--dir", "/data", "--port", "8081" ]
