package com.swiftlogistics.tracking_service.service;

import com.swiftlogistics.tracking_service.config.RabbitMqConfig;
import com.swiftlogistics.tracking_service.dto.PackageStoredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PackageStoredListener {
    private final TrackingService trackingService;

    @RabbitListener(queues = RabbitMqConfig.PACKAGE_STORED_QUEUE)
    public void onPackageStored(PackageStoredEvent event) {
        log.info(
                "Tracking received PackageStored event: orderNumber={}, packageId={}",
                event.getOrderNumber(),
                event.getPackageId()
        );
        trackingService.handlePackageStored(event);
    }
}
