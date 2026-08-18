package com.swiftlogistics.gateway.controller;

import com.swiftlogistics.gateway.dto.SystemStatusResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/gateway")
@RequiredArgsConstructor
@Slf4j
public class SystemStatusController {
    private final RestTemplate restTemplate;

    @Value("${rabbitmq.management.host}")
    private String rabbitmqHost;

    @Value("${rabbitmq.management.port}")
    private String rabbitmqPort;

    @Value("${rabbitmq.management.username}")
    private String rabbitmqUsername;

    @Value("${rabbitmq.management.password}")
    private String rabbitmqPassword;

    @GetMapping("/system-status")
    public SystemStatusResponse systemStatus() {
        return SystemStatusResponse.builder()
                .gatewayStatus("UP")
                .rabbitmqStatus(checkRabbitMq())
                .build();
    }

    private String checkRabbitMq() {
        String url = "http://" + rabbitmqHost + ":" + rabbitmqPort + "/api/overview";

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(rabbitmqUsername, rabbitmqPassword);

        try {
            restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            return "UP";
        } catch (RestClientException exception) {
            log.warn("RabbitMQ management API check failed: {}", exception.getMessage());
            return "DOWN";
        }
    }
}
