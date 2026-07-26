package com.swiftlogistics.order_service.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.swiftlogistics.order_service.model.User;
import org.springframework.stereotype.Component;
import java.util.Date;

@Component
public class JwtUtil {
    private static final String SECRET = "SwiftLogisticsSecretKeyForJWTAuthentication2026";
    private static final String ISSUER = "swiftlogistics";
    private static final long EXPIRATION_TIME = 86400000; // 24 hours in milliseconds
    private final Algorithm algorithm = Algorithm.HMAC256(SECRET);

    public String generateToken(User user) {
        return JWT.create()
                .withIssuer(ISSUER)
                .withClaim("userId", user.getId())
                .withClaim("username", user.getUsername())
                .withClaim("role", user.getRole())
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .sign(algorithm);
    }

    public DecodedJWT validateToken(String token) {
        JWTVerifier verifier = JWT.require(algorithm)
                .withIssuer(ISSUER)
                .build();
        return verifier.verify(token);
    }
}
