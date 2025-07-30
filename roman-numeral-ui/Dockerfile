# roman-numeral-ui/Dockerfile

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Use a lightweight static file server (like serve or nginx)
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "5173"]

EXPOSE 5173
