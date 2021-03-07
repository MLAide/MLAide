### STAGE 1: Build ###
FROM node:12.7-alpine AS build
WORKDIR /usr/src/app
ENV PATH="./node_modules/.bin:$PATH"
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
RUN ng build --prod

### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/web-ui /usr/share/nginx/html

# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/config/config.prod.tokenized.json > /usr/share/nginx/html/assets/config/config.prod.json && exec nginx -g 'daemon off;'"]