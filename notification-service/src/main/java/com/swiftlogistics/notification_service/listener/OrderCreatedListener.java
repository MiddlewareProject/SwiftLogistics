package com.swiftlogistics.notification_service.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.swiftlogistics.notification_service.config.RabbitMQConfig;
import com.swiftlogistics.notification_service.dto.OrderCreatedEvent;
import com.swiftlogistics.notification_service.service.NotificationService;

@Component
public class OrderCreatedListener {

    private final NotificationService notificationService;

    public OrderCreatedListener(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    @RabbitListener(
            queues = RabbitMQConfig.ORDER_QUEUE
    )
    public void handleOrderCreated(
            OrderCreatedEvent event) {

        System.out.println(
                "Received OrderCreatedEvent: "
                        + event.getOrderNumber()
        );

        notificationService.createOrderCreatedNotification(
                event.getOrderNumber(),
                event.getClientId(),
                event.getDescription()
        );
    }
}
