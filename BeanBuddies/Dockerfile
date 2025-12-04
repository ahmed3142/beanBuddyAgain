# Stage 1: Build the application with Maven
FROM maven:3.9-eclipse-temurin-17 AS build

# Set the working directory
WORKDIR /app

# Copy the pom.xml file first, specifying the subfolder
COPY BeanBuddies/pom.xml .

# Download dependencies
RUN mvn dependency:go-offline

# Copy the source code, specifying the subfolder
COPY BeanBuddies/src ./src

# Package the application
RUN mvn package -DskipTests

# Stage 2: Create the final runtime image
FROM eclipse-temurin:17-jre-jammy

# Set a working directory
WORKDIR /app

# Copy the built JAR file from the 'build' stage
COPY --from=build /app/target/BeanBuddies-0.0.1-SNAPSHOT.jar app.jar

# Expose the port
EXPOSE 8081

# --- EIKHANE CHANGE KORA HOYECHE ---
# Run the application using a relative path (relies on WORKDIR /app)
ENTRYPOINT ["java", "-jar", "app.jar"]