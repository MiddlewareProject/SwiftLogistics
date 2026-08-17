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

        int maxAttempts = 10;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            if (trackingService.assignDriver(event)) {
                return;
            }

            log.warn(
                    "Tracking record not ready for {}, retrying driver assignment ({}/{})",
                    event.getOrderNumber(),
                    attempt,
                    maxAttempts
            );

            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException(
                        "Driver assignment retry interrupted", e
                );
            }
        }

        throw new IllegalStateException(
                "Unable to assign driver after retries: "
                        + event.getOrderNumber()
        );
    }
}