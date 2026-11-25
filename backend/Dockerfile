# Stage 1: Build with JDK 21 + Maven
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests package

# Stage 2: Minimal JRE 21 runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S clareia && adduser -S clareia -G clareia
COPY --from=build /app/target/clareia-backend-*.jar app.jar
RUN chown clareia:clareia app.jar

USER clareia
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
