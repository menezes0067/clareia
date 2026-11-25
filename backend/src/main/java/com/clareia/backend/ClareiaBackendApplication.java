package com.clareia.backend;

import com.clareia.backend.config.ClareiaProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableConfigurationProperties(ClareiaProperties.class)
public class ClareiaBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClareiaBackendApplication.class, args);
    }
}
