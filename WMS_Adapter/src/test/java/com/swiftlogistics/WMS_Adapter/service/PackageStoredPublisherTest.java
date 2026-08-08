package com.swiftlogistics.WMS_Adapter.service;

import com.swiftlogistics.WMS_Adapter.config.RabbitMqConfig;
import com.swiftlogistics.WMS_Adapter.dto.PackageStoredEvent;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDateTime;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class PackageStoredPublisherTest {

    @Test
    void publishesPackageStoredEventToConfiguredExchangeAndRoutingKey() {
        RabbitTemplate rabbitTemplate = mock(RabbitTemplate.class);
        PackageStoredPublisher publisher = new PackageStoredPublisher(rabbitTemplate);
        PackageStoredEvent event = PackageStoredEvent.builder()
                .orderNumber("SL-PHASE4-001")
                .clientId(4L)
                .packageId("PKG-123ABC")
                .status("WAREHOUSE")
                .warehouseLocation("A-12")
                .storedAt(LocalDateTime.now())
                .build();

        publisher.publish(event);

        verify(rabbitTemplate).convertAndSend(
                RabbitMqConfig.PACKAGE_STORED_EXCHANGE,
                RabbitMqConfig.PACKAGE_STORED_ROUTING_KEY,
                event
        );
    }
}
