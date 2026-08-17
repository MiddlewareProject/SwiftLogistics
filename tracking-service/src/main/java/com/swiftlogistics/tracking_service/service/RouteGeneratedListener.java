package com.swiftlogistics.tracking_service.service;

import com.swiftlogistics.tracking_service.config.RabbitMqConfig;
import com.swiftlogistics.tracking_service.dto.RouteGeneratedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RouteGeneratedListener {

    private final TrackingService trackingService;

    @RabbitListener(queues = RabbitMqConfig.ROUTE_GENERATED_QUEUE)
    public void onRouteGenerated(RouteGeneratedEvent event) {
        log.info(
                "Tracking received RouteGenerated event: orderNumber={}, driverId={}, driverName={}",
                event.getOrderNumber(),
                event.getDriverId(),
                event.getDriverName()
        );

        trackingService.assignDriver(event);
    }
}