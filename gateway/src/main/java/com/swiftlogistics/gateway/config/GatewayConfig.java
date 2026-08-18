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

    RouterFunction<ServerResponse> rosRoutes = route("ros-adapter-route")
        .route(RequestPredicates.path("/api/ros/**"), http())
        .filter(jwtAuthenticationFilter)
        .before(uri(URI.create("http://ros-adapter:8084")))
        .build();

    RouterFunction<ServerResponse> trackingRoutes = route("tracking-service-route")
        .route(RequestPredicates.path("/api/tracking/**"), http())
        .filter(jwtAuthenticationFilter)
        .before(uri(URI.create("http://tracking-service:8082")))
        .build();

    RouterFunction<ServerResponse> wmsRoutes = route("wms-adapter-route")
        .route(RequestPredicates.path("/api/wms/**"), http())
        .filter(jwtAuthenticationFilter)
        .before(uri(URI.create("http://wms-adapter:8085")))
        .build();

    RouterFunction<ServerResponse> notificationRoutes = route("notification-service-route")
        .route(RequestPredicates.path("/api/notifications/**"), http())
        .filter(jwtAuthenticationFilter)
        .before(uri(URI.create("http://notification-service:8086")))
        .build();

    return orderRoutes.andOther(cmsRoutes).andOther(rosRoutes).andOther(trackingRoutes).andOther(wmsRoutes).andOther(notificationRoutes);
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
