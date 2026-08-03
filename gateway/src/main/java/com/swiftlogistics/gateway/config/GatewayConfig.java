package com.swiftlogistics.gateway.config;

import com.swiftlogistics.gateway.filter.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;
import java.net.URI;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;

@Configuration
public class GatewayConfig {

    @Bean
        public RouterFunction<?> gatewayRoutes(JwtAuthenticationFilter jwtAuthenticationFilter) {
    RouterFunction<ServerResponse> orderRoutes = route("order-service-route")
                .route(RequestPredicates.path("/api/auth/**")
                        .or(RequestPredicates.path("/api/orders/**")), http())
                .filter(jwtAuthenticationFilter)
                .before(uri(URI.create("http://order-service:8081")))
        .build();

    RouterFunction<ServerResponse> cmsRoutes = route("cms-adapter-route")
        .route(RequestPredicates.path("/api/cms/**"), http())
        .filter(jwtAuthenticationFilter)
        .before(uri(URI.create("http://cms-adapter:8083")))
        .build();

    return orderRoutes.andOther(cmsRoutes);
    }

    @Bean
    public org.springframework.web.filter.CorsFilter corsFilter() {
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        org.springframework.web.cors.CorsConfiguration config = new org.springframework.web.cors.CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOriginPattern("*"); // fallback / backup
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new org.springframework.web.filter.CorsFilter(source);
    }
}
