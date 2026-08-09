package com.swiftlogistics.WMS_Adapter.service;

import com.swiftlogistics.WMS_Adapter.config.RabbitMqConfig;
import com.swiftlogistics.WMS_Adapter.dto.PackageStoredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PackageStoredPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void publish(PackageStoredEvent event) {
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.PACKAGE_STORED_EXCHANGE,
                RabbitMqConfig.PACKAGE_STORED_ROUTING_KEY,
                event
        );

        log.info(
                "PackageStored published: orderNumber={}, packageId={}, status={}",
                event.getOrderNumber(),
                event.getPackageId(),
                event.getStatus()
        );
    }
}
