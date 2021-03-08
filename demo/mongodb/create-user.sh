# https://saeidfarahi.medium.com/get-started-with-spring-boot-mongodb-and-docker-compose-cfae8283ed1b
#!/bin/bash
mongo -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase "$rootAuthDatabase" "$MONGO_INITDB_DATABASE" --eval "db.createUser({ user: '$MONGO_DB_USERNAME', pwd: '$MONGO_DB_PASSWORD', roles: [{ role: 'dbOwner', db: '$MONGO_INITDB_DATABASE' }] })"