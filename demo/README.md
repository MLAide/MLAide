# MLAide demo environment
MLAide can be started via docker compose. Docker compose provides an easy way to run multi-container applications.

Add the following entry to your hosts file. 
The file is located at `/etc/hosts` (Unix) or `C:\Windows\System32\drivers\etc\hosts` (Windows).
```
127.0.0.1 keycloak.mlaide
```

After that start MLAide using 
```
docker-compose up
```

Now you should have several containers running:
- **MLAide web user interface**
- **MLAide webserver**
- **MongoDB** that is used by the webserver to store all structured metadata
- **min.io** that is used by the webserver to store all artifacts and models
- **keycloak** to provide an identity provider, authentication and authorization

You can access the [Web UI on localhost:8880](http://localhost:8880) with your browser. This demo
provides three pre-defined users:
- adam (password = adam1)
- brian (password = brian1)
- eve (password = eve1)

Now you can start writing your machine learning app with Python. Use the following snippet to create a connection from your Python app to MLAide.

```python
```