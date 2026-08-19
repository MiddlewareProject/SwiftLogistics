package com.swiftlogistics.tracking_service.service;

import com.swiftlogistics.tracking_service.dto.RouteGeneratedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Service
@Slf4j
public class RosRouteLookupClient {
    private final RestTemplate restTemplate;
    private final String routeLookupUrl;

    public RosRouteLookupClient(
            @Value("${app.ros-route-lookup-url:http://ros-adapter:8084/api/ros/routes/{orderNumber}}") String routeLookupUrl
    ) {
        this.restTemplate = new RestTemplate();
        this.routeLookupUrl = routeLookupUrl;
    }

    public Optional<RouteGeneratedEvent> findRoute(String orderNumber) {
        try {
            RouteGeneratedEvent route = restTemplate.getForObject(routeLookupUrl, RouteGeneratedEvent.class, orderNumber);
            return Optional.ofNullable(route);
        } catch (RestClientException | IllegalArgumentException exception) {
            log.warn("Unable to recover ROS route assignment for order {}: {}", orderNumber, exception.getMessage());
            return Optional.empty();
        }
    }
}
