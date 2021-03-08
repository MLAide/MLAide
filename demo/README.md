# MLAide demo environment
MLAide can be started via docker compose. Docker compose provides an easy way to run multi-container applications.
You just have to run `docker-compose up` to get everything working.

After starting all containers you should have several containers running:
- **MLAide web user interface**
- **MLAide webserver**
- **MongoDB** that is used by the webserver to store all structured metadata
- **min.io** that is used by the webserver to store all artifacts and models
- **keycloack** to provide an identity provider, authentication and authorization

You can access the [Web UI on localhost:7777](http://localhost:7777) with your browser. This demo
provides three pre-defined users:
- adam (password = adam)
- brian (password = brian)
- eve (password = eve)

Now you can start writing your machine learning app with Python. Use the following snippet to create a
connection from your Python app to MLAide.

```python
```

# TODO: Add api key