FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/web-ui /usr/share/nginx/html

# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/config/config.prod.tokenized.json > /usr/share/nginx/html/assets/config/config.prod.json && exec nginx -g 'daemon off;'"]
