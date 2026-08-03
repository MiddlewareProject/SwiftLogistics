package com.swiftlogistics.ROS_Adapter.service;

import com.swiftlogistics.ROS_Adapter.config.RabbitMqConfig;
import com.swiftlogistics.ROS_Adapter.dto.OrderCreatedEvent;
import com.swiftlogistics.ROS_Adapter.dto.RosDashboardSnapshot;
import com.swiftlogistics.ROS_Adapter.dto.RosEventLogEntry;
import com.swiftlogistics.ROS_Adapter.dto.RouteGeneratedEvent;
import com.swiftlogistics.ROS_Adapter.dto.RouteResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class RosIntegrationService {
    private static final int MAX_EVENTS = 20;
    private static final int MAX_RECENT_ROUTES = 20;
    private static final String MOCK_ROS_OPTIMIZE_URL = "http://localhost:8084/mock-ros/optimize";

    private final MockRosService mockRosService;
    private final RabbitTemplate rabbitTemplate;
    private final RestTemplate restTemplate;

    private final AtomicLong routesGenerated = new AtomicLong();
    private final AtomicLong totalOptimizationTimeMs = new AtomicLong();
    private final Map<String, RouteResult> latestResults = new ConcurrentHashMap<>();
    private final Deque<RosEventLogEntry> eventLog = new ConcurrentLinkedDeque<>();
    private final Deque<RouteResult> recentRoutes = new ConcurrentLinkedDeque<>();

    @RabbitListener(queues = RabbitMqConfig.ORDER_CREATED_QUEUE)
    public void onOrderCreated(OrderCreatedEvent event) {
        processOrder(event);
    }

    public RosDashboardSnapshot getDashboardSnapshot() {
        long generated = routesGenerated.get();
        long avgOptimizationTimeMs = generated > 0 ? totalOptimizationTimeMs.get() / generated : 0;

        return RosDashboardSnapshot.builder()
                .connected(mockRosService.isHealthy())
                .routesGenerated(generated)
                .vehicleCount(mockRosService.getVehicleCount())
                .driverCount(mockRosService.getDriverCount())
                .avgOptimizationTimeMs(avgOptimizationTimeMs)
                .recentEvents(getRecentEvents())
                .recentRoutes(List.copyOf(recentRoutes))
                .vehicleStatus(mockRosService.getVehicleStatuses())
                .build();
    }

    public List<RosEventLogEntry> getRecentEvents() {
        return eventLog.stream().limit(MAX_EVENTS).toList();
    }

    public RouteResult getRoute(String orderNumber) {
        RouteResult result = latestResults.get(orderNumber);
        if (result == null) {
            throw new IllegalArgumentException("No route found for order " + orderNumber);
        }
        return result;
    }

    public Optional<RouteResult> getLatestRoute() {
        return recentRoutes.stream().findFirst();
    }

    private void processOrder(OrderCreatedEvent event) {
        recordEvent("OrderCreated Received", "Processing order " + event.getOrderNumber());
        recordEvent("REST Request Sent", "Calling ROS optimize endpoint for order " + event.getOrderNumber());

        RouteResult result;
        try {
            result = restTemplate.postForObject(MOCK_ROS_OPTIMIZE_URL, event, RouteResult.class);
        } catch (RestClientException exception) {
            recordEvent("Route Optimization Failed", exception.getMessage());
            log.error("Failed to call mock ROS for order {}: {}", event.getOrderNumber(), exception.getMessage());
            return;
        }

        if (result == null) {
            recordEvent("Route Optimization Failed", "Mock ROS returned an empty response for order " + event.getOrderNumber());
            return;
        }

        routesGenerated.incrementAndGet();
        totalOptimizationTimeMs.addAndGet(result.getOptimizationTimeMs());
        latestResults.put(event.getOrderNumber(), result);

        recentRoutes.addFirst(result);
        while (recentRoutes.size() > MAX_RECENT_ROUTES) {
            recentRoutes.removeLast();
        }

        recordEvent("Route Optimized", "Optimal route generated for order " + event.getOrderNumber()
                + " (" + result.getDistanceKm() + " km)");
        recordEvent("Driver Assigned", result.getDriverName() + " assigned to order " + event.getOrderNumber());

        publishRouteGeneratedEvent(event, result);

        recordEvent("RouteGenerated Published", "Order " + event.getOrderNumber() + " published to RabbitMQ");
    }

    private void publishRouteGeneratedEvent(OrderCreatedEvent orderEvent, RouteResult result) {
        RouteGeneratedEvent event = RouteGeneratedEvent.builder()
                .orderNumber(orderEvent.getOrderNumber())
                .clientId(orderEvent.getClientId())
                .routeId(result.getRouteId())
                .driverId(result.getDriverId())
                .driverName(result.getDriverName())
                .vehicleId(result.getVehicleId())
                .vehiclePlate(result.getVehiclePlate())
                .distanceKm(result.getDistanceKm())
                .durationMinutes(result.getDurationMinutes())
                .trafficLevel(result.getTrafficLevel())
                .generatedAt(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMqConfig.ROUTE_GENERATED_EXCHANGE,
                RabbitMqConfig.ROUTE_GENERATED_ROUTING_KEY,
                event
        );
    }

    private void recordEvent(String event, String details) {
        eventLog.addFirst(RosEventLogEntry.builder()
                .time(LocalDateTime.now())
                .event(event)
                .details(details)
                .build());

        while (eventLog.size() > MAX_EVENTS) {
            eventLog.removeLast();
        }

        log.info("ROS event [{}]: {}", event, details);
    }
}
