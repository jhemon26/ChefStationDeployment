FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache vips-dev build-base python3

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p /app/uploads/recipes

EXPOSE 5000

CMD ["node", "src/index.js"]
