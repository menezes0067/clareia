package com.clareia.backend.security;

import com.clareia.backend.config.ClareiaProperties;
import com.clareia.backend.domain.entity.Dentist;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final String issuer;
    private final long expirationSeconds;
    private final Clock clock;

    public JwtService(ClareiaProperties properties, Clock clock) {
        String secret = properties.jwt() != null ? properties.jwt().secret() : null;
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET não configurado ou curto demais (mínimo de 32 bytes). Defina JWT_SECRET no arquivo .env."
            );
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = properties.jwt().issuer() != null ? properties.jwt().issuer() : "clareia-api";
        this.expirationSeconds = properties.jwt().expirationSeconds() > 0
                ? properties.jwt().expirationSeconds()
                : 28800L;
        this.clock = clock;
    }

    public String generateToken(Dentist dentist) {
        Instant now = Instant.now(clock);
        Instant expiresAt = now.plusSeconds(expirationSeconds);
        return Jwts.builder()
                .issuer(issuer)
                .subject(dentist.getId())
                .claim("clinicId", dentist.getClinicId())
                .claim("role", dentist.getRole().getValue())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public Optional<TokenClaims> parseToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(issuer)
                    .clock(() -> Date.from(Instant.now(clock)))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            String dentistId = claims.getSubject();
            String clinicId = claims.get("clinicId", String.class);
            if (dentistId == null || clinicId == null) {
                return Optional.empty();
            }
            return Optional.of(new TokenClaims(dentistId, clinicId));
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    public record TokenClaims(String dentistId, String clinicId) {}
}
