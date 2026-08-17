package com.swiftlogistics.notification_service.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.swiftlogistics.notification_service.config.RabbitMQConfig;
import com.swiftlogistics.notification_service.dto.TrackingUpdatedEvent;
import com.swiftlogistics.notification_service.service.NotificationService;

@Component
public class TrackingUpdatedListener {

    private final NotificationService notificationService;

    public TrackingUpdatedListener(
            NotificationService notificationService) {

        this.notificationService =
                notificationService;
    }

    @RabbitListener(
            queues = RabbitMQConfig.TRACKING_QUEUE
    )
    public void handleTrackingUpdated(
            TrackingUpdatedEvent event) {

        System.out.println(
                "Received TrackingUpdatedEvent: "
                        + event.getOrderNumber()
                        + " - "
                        + event.getStatus()
        );

        notificationService.createAndBroadcast(
                event.getOrderNumber(),
                event.getClientId(),
                event.getPackageId(),
                event.getStatus(),
                event.getLocation(),
                event.getDescription()
        );
    }
}