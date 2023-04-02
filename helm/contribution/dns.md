# DNS Setup

1. Manually reserve IP addresses on GCP
   - mlaide-webserver
   - mlaide-ui
   - mlaide-keycloak
2. Change DNS A-records to created IP addresses
   - `api.demo.mlaide.com` -> mlaide-webserver
   - `demo.mlaide.com` -> mlaide-ui
   - `login.demo.mlaide.com` -> mlaide-keycloak
3. Optionally create TLS certificates using Certbot

   ```bash
   certbot certonly \
     -d login.k8s-demo.mlaide.com \
     --manual \
     --preferred-challenges dns \
     --config-dir ./.cert/config \
     --work-dir ./.cert \
     --logs-dir ./.cert/logs

   certbot certonly \
     -d api.k8s-demo.mlaide.com \
     --manual \
     --preferred-challenges dns \
     --config-dir ./.cert/config \
     --work-dir ./.cert \
     --logs-dir ./.cert/logs

   certbot certonly \
     -d k8s-demo.mlaide.com \
     --manual \
     --preferred-challenges dns \
     --config-dir ./.cert/config \
     --work-dir ./.cert \
     --logs-dir ./.cert/logs
   ```
