package com.swiftlogistics.gateway.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class GatewayRouteConfigurationTest {

    @Test
    void applicationPropertiesDoesNotDefineDuplicateUnfilteredGatewayRoutes() throws Exception {
        ClassPathResource resource = new ClassPathResource("application.properties");
        String properties = resource.getContentAsString(StandardCharsets.UTF_8);

        assertThat(properties).doesNotContain("```");
        assertThat(properties).doesNotContain("spring.cloud.gateway.mvc.routes");
    }
}
