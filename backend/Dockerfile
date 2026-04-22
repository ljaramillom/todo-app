# syntax=docker/dockerfile:1
# Multi-stage: Maven (JDK 25) → JRE 25 + capas Spring Boot (arranque más rápido y mejor caché)
# Etiquetas verificadas en Docker Hub (no usar 3.9.9-temurin-25-alpine: no existe).
FROM maven:3.9.15-eclipse-temurin-25-alpine AS builder
WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn -B -DskipTests package \
    && JAR_FILE="$(ls target/*.jar | grep -v 'original' | head -n1)" \
    && test -n "$JAR_FILE" \
    && java -Djarmode=layertools -jar "$JAR_FILE" extract

FROM eclipse-temurin:25-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S spring -g 1000 && adduser -S spring -u 1000 -G spring

COPY --from=builder /build/dependencies/ ./
COPY --from=builder /build/spring-boot-loader/ ./
COPY --from=builder /build/snapshot-dependencies/ ./
COPY --from=builder /build/application/ ./

USER spring:spring

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
