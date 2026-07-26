package com.swiftlogistics.gateway.filter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.function.HandlerFilterFunction;
import org.springframework.web.servlet.function.HandlerFunction;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter implements HandlerFilterFunction<ServerResponse, ServerResponse> {
    private static final String SECRET = "SwiftLogisticsSecretKeyForJWTAuthentication2026";
    private static final String ISSUER = "swiftlogistics";
    private final Algorithm algorithm = Algorithm.HMAC256(SECRET);

    @Override
    public ServerResponse filter(ServerRequest request, HandlerFunction<ServerResponse> next) throws Exception {
        String path = request.path();
        
        // Skip validation for auth endpoints and public order status endpoint
        if (path.startsWith("/api/auth/") || path.startsWith("/api/orders/status/")) {
            return next.handle(request);
        }

        // Get Authorization header
        String authHeader = request.headers().firstHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ServerResponse.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        try {
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer(ISSUER)
                    .build();
            DecodedJWT jwt = verifier.verify(token);

            Long userId = jwt.getClaim("userId").asLong();
            String username = jwt.getClaim("username").asString();
            String role = jwt.getClaim("role").asString();

            // Mutate request to add user context in headers
            ServerRequest mutatedRequest = ServerRequest.from(request)
                    .header("X-User-Id", String.valueOf(userId))
                    .header("X-User-Username", username)
                    .header("X-User-Role", role)
                    .build();

            return next.handle(mutatedRequest);
        } catch (Exception e) {
            return ServerResponse.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Invalid or expired JWT token");
        }
    }
}
