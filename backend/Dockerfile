# ============================================================
# Multi-stage Dockerfile for Spring Boot (Optimized for Free Tier)
# ============================================================

# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build source code
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Production runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port (Render automatically maps $PORT, Spring Boot listens on 8080 or $PORT)
ENV PORT=8080
EXPOSE 8080

# Tune JVM for 512MB RAM free-tier containers
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Dserver.port=${PORT}", "-jar", "app.jar"]

