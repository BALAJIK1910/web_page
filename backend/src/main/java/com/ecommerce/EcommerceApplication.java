package com.ecommerce;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.sql.Connection;

@Slf4j
@SpringBootApplication
public class EcommerceApplication {

    private final Environment environment;
    private final DataSource dataSource;

    public EcommerceApplication(Environment environment, DataSource dataSource) {
        this.environment = environment;
        this.dataSource = dataSource;
    }

    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        String dbUrl = environment.getProperty("spring.datasource.url", "");
        String dbUser = environment.getProperty("spring.datasource.username", "");

        log.info("=========================================================");
        log.info("  E-Commerce API started!");
        log.info("  API Base: http://localhost:{}/api", environment.getProperty("server.port", "8080"));
        log.info("  Testing database connection to: {}", dbUrl);

        try (Connection conn = dataSource.getConnection()) {
            log.info("  >> Database connection SUCCESSFUL! (Catalog: {})", conn.getCatalog());
            log.info("=========================================================");
        } catch (Exception ex) {
            log.error("  >> DATABASE CONNECTION FAILED!");
            log.error("  >> Reason: {}", ex.getMessage());
            log.error("  Please verify SUPABASE_DB_URL, SUPABASE_DB_USER, and SUPABASE_DB_PASSWORD.");
            log.error("=========================================================");
        }
    }
}
