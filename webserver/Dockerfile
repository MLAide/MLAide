FROM openjdk:11.0.4-jre-slim

# run as user
RUN groupadd mlaidegroup
RUN useradd -G mlaidegroup mlaide
USER mlaide:mlaide

# run app
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]