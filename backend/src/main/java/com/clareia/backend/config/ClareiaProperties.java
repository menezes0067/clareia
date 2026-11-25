package com.clareia.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;

@ConfigurationProperties(prefix = "clareia")
public record ClareiaProperties(
        String timezone,
        JwtProperties jwt,
        CorsProperties cors,
        DemoProperties demo
) {

    public ZoneId zoneId() {
        return ZoneId.of(timezone != null && !timezone.isBlank() ? timezone : "America/Sao_Paulo");
    }

    public record JwtProperties(
            String secret,
            String issuer,
            long expirationSeconds
    ) {}

    public record CorsProperties(
            String allowedOrigins
    ) {
        public List<String> originList() {
            if (allowedOrigins == null || allowedOrigins.isBlank()) {
                return List.of("http://localhost:5173");
            }
            return Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }

    public record DemoProperties(
            boolean enabled,
            boolean seedOnStartup,
            String defaultPassword
    ) {}
}
