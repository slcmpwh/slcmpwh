FROM node:18-alpine
WORKDIR /app
COPY package.json package.json
COPY server.js server.js
COPY data.json data.json
COPY public public
RUN npm install --production
EXPOSE 3000
CMD ["node", "server.js"]