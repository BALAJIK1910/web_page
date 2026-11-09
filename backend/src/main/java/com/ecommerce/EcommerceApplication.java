package com.ecommerce;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;

@Slf4j
@SpringBootApplication
public class EcommerceApplication {

    private final Environment environment;

    public EcommerceApplication(Environment environment) {
        this.environment = environment;
    }

    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        String dbUrl = environment.getProperty("spring.datasource.url", "");
        String dbUser = environment.getProperty("spring.datasource.username", "");

        if (dbUrl.isBlank() || dbUser.isBlank()) {
            log.warn("=========================================================");
            log.warn("  WARNING: Supabase credentials are NOT configured.");
            log.warn("  The application started but database operations will fail.");
            log.warn("  Please set the following environment variables:");
            log.warn("    SUPABASE_DB_URL      - PostgreSQL JDBC URL");
            log.warn("    SUPABASE_DB_USER     - Database username");
            log.warn("    SUPABASE_DB_PASSWORD - Database password");
            log.warn("  See .env.example for reference.");
            log.warn("=========================================================");
        } else {
            log.info("=========================================================");
            log.info("  E-Commerce API started successfully!");
            log.info("  Database: {}", dbUrl);
            log.info("  API Base: http://localhost:{}/api", environment.getProperty("server.port", "8080"));
            log.info("=========================================================");
        }
    }
}
