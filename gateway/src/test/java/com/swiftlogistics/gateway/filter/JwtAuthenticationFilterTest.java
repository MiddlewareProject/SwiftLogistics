package com.swiftlogistics.gateway.filter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.servlet.function.HandlerFunction;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtAuthenticationFilterTest {
    private static final String SECRET = "SwiftLogisticsSecretKeyForJWTAuthentication2026";
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter();

    @Test
    void registerDriverIsNotPublicWithoutAuthentication() throws Exception {
        ServerResponse response = filter.filter(request("/api/auth/register-driver", null), okHandler());

        assertThat(response.statusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void publicLoginStillBypassesAuthentication() throws Exception {
        ServerResponse response = filter.filter(request("/api/auth/login", null), okHandler());

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void validJwtReplacesClientSuppliedUserHeaders() throws Exception {
        String token = JWT.create()
                .withIssuer("swiftlogistics")
                .withClaim("userId", 42L)
                .withClaim("username", "DRV-01")
                .withClaim("role", "DRIVER")
                .sign(Algorithm.HMAC256(SECRET));
        MockHttpServletRequest servletRequest = new MockHttpServletRequest("GET", "/api/tracking/driver");
        servletRequest.addHeader("Authorization", "Bearer " + token);
        servletRequest.addHeader("X-User-Id", "999");
        servletRequest.addHeader("X-User-Username", "admin@example.com");
        servletRequest.addHeader("X-User-Role", "ADMIN");
        ServerRequest request = ServerRequest.create(servletRequest, List.of());

        ServerResponse response = filter.filter(request, filteredRequest -> {
            assertThat(filteredRequest.headers().firstHeader("X-User-Id")).isEqualTo("42");
            assertThat(filteredRequest.headers().firstHeader("X-User-Username")).isEqualTo("DRV-01");
            assertThat(filteredRequest.headers().firstHeader("X-User-Role")).isEqualTo("DRIVER");
            return ServerResponse.ok().body("ok");
        });

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK);
    }

    private ServerRequest request(String path, String authorization) {
        ServerRequest request = mock(ServerRequest.class);
        ServerRequest.Headers headers = mock(ServerRequest.Headers.class);
        when(request.path()).thenReturn(path);
        when(request.headers()).thenReturn(headers);
        when(headers.firstHeader("Authorization")).thenReturn(authorization);
        return request;
    }

    private HandlerFunction<ServerResponse> okHandler() {
        return request -> ServerResponse.ok().body("ok");
    }
}
