# Keycloak Setup
This helm chart uses keycloak for the **demo** deployment. Keycloak is configured
to have a demo realm with pre-initialized users.

To change the configuration start Keycloak, login as an admin and apply the required 
changes. Use the following commands to export the configuration and provide as part
of this helm chart.

1. Login to the running Keycloak pod
2. Run command to export configuration
    ```
    /opt/jboss/keycloak/bin/standalone.sh \
      -Dkeycloak.migration.action=export \
      -Dkeycloak.migration.provider=singleFile \
      -Dkeycloak.migration.file=/tmp/realms-export-single-file.json \
      -Djboss.socket.binding.port-offset=99
    ```
3. Copy config file from pod to local filesystem
    ```
    kubectl cp mlaide/my-mlaide-keycloak-0:/tmp/realms-export-single-file.json ./export.json
    ```
4. Modify JSON to only contain `mlaide-demo` realm
5. Create new secret containing the config
     ```
     kubectl create secret generic demo-realm-secret \
       --from-file=export.json \
       --dry-run=client \
       -o=yaml \
       > templates/keycloak/demo-realm-secret.yaml
     ```