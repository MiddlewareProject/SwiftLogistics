package com.swiftlogistics.notification_service.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private static final String SECRET =
            "SwiftLogisticsSecretKeyForJWTAuthentication2026";

    private static final String ISSUER =
            "swiftlogistics";

    private static final long EXPIRATION_TIME =
            8 * 60 * 60 * 1000L; // 8 hours

    private final SecretKey key =
            Keys.hmacShaKeyFor(
                    SECRET.getBytes(StandardCharsets.UTF_8)
            );

    public String generateToken(String driverId) {

        return Jwts.builder()
                .subject(driverId)
                .issuer(ISSUER)
                .claim("role", "DRIVER")
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + EXPIRATION_TIME
                        )
                )
                .signWith(key)
                .compact();
    }

    public String extractDriverId(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isValid(String token) {

        try {
            getClaims(token);
            return true;

        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}