# Model Version Control Webserver

See the [ML Aide docs](https://mlaide.github.io/docs/) for
user documentation.

## Building and running from source on localhost
### Setup and run
- Install and start MongoDB
- Provide a S3 compatible Storage
- Compile and start app: `mvn spring-boot:run`

#### Use min.io as S3
You can use min.io running on Docker for development. You have to install Docker and Docker Compose.
After installation run the following commands:
```
cd local-minio
docker-compose pull
docker-compose up
```

You can access the min.io user interface at [http://localhost:9001](http://localhost:9001).
Access Key = `minio`; Secret Key = `minio123`.

##### Deleting Docker volumes

Stop the container(s) using the following command:
```
docker-compose down
```
Delete all containers using the following command:
```
docker rm -f $(docker ps -a -q)
```
Delete all volumes usig the following command:
```
docker volume rm $(docker volume ls -q)
```
Restart the containers using the following command:
```
docker-compose up -d
```

##### Debugging min.io
You can use the minio docker image from bitnami which ships also the minio cli tool. This tool provied debug tracing.

Start the container
```
docker run -p 9001:9000 \
  -e "MINIO_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE" \
  -e "MINIO_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" \
  bitnami/minio server /mlaide-s3-data{1...8}
```

In another terminal you can now see the logs:
```
docker exec minio mc admin trace --verbose local
```

### Build the docker image
```
mvn package
docker build mlaide/webserver -t latest -t {version} .
```