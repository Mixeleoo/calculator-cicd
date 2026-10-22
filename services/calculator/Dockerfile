FROM node:20-alpine AS test
WORKDIR /app
COPY package.json server.js test.js ./
RUN node --test test.js

FROM node:20-alpine
WORKDIR /app
COPY package.json server.js ./
ENV NODE_ENV=production
EXPOSE 8080
USER node
CMD ["node", "server.js"]
