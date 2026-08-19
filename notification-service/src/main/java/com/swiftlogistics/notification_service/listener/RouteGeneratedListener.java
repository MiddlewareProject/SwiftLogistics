package com.swiftlogistics.notification_service.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.swiftlogistics.notification_service.config.RabbitMQConfig;
import com.swiftlogistics.notification_service.dto.RouteGeneratedEvent;
import com.swiftlogistics.notification_service.service.NotificationService;

@Component
public class RouteGeneratedListener {

    private final NotificationService notificationService;

    public RouteGeneratedListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = RabbitMQConfig.ROUTE_QUEUE)
    public void handleRouteGenerated(RouteGeneratedEvent event) {

        System.out.println(
                "Received RouteGeneratedEvent: "
                        + event.getOrderNumber()
                        + " -> driver " + event.getDriverId()
        );

        notificationService.createDriverAssignedNotification(
                event.getOrderNumber(),
                event.getDriverId(),
                event.getDriverName(),
                event.getVehiclePlate(),
                event.getDistanceKm()
        );
    }
}
