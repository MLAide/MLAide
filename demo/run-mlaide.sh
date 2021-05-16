echo "Downloading ML Aide Tutorial Docker Compose file"
curl https://raw.githubusercontent.com/MLAide/MLAide/master/demo/docker-compose.yml --output ./docker-compose.yml

echo "Downloading ML Aide Tutorial configuration files"
mkdir keycloak
mkdir minio
mkdir mongodb
curl https://raw.githubusercontent.com/MLAide/MLAide/master/demo/.env --output ./.env
curl https://raw.githubusercontent.com/MLAide/MLAide/master/demo/README.md --output ./README.md
curl https://raw.githubusercontent.com/MLAide/MLAide/master/demo/keycloak/mlaide.json --output ./keycloak/mlaide.json
curl https://raw.githubusercontent.com/MLAide/MLAide/master/demo/minio/nginx.conf --output ./minio/nginx.conf
curl https://raw.githubusercontent.com/MLAide/MLAide/master/demo/mongodb/create-user.sh --output ./mongodb/create-user.sh

echo "Starting ML Aide"
docker-compose up
