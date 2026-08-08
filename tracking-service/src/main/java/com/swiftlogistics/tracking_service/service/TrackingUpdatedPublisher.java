package com.swiftlogistics.tracking_service.service;

import com.swiftlogistics.tracking_service.config.RabbitMqConfig;
import com.swiftlogistics.tracking_service.dto.TrackingUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingUpdatedPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void publish(TrackingUpdatedEvent event) {
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.TRACKING_UPDATED_EXCHANGE,
                RabbitMqConfig.TRACKING_UPDATED_ROUTING_KEY,
                event
        );

        log.info(
                "TrackingUpdated published: orderNumber={}, packageId={}, status={}",
                event.getOrderNumber(),
                event.getPackageId(),
                event.getStatus()
        );
    }
}
