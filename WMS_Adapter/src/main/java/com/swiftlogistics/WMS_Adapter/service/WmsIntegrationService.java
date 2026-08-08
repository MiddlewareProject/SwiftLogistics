package com.swiftlogistics.WMS_Adapter.service;

import com.swiftlogistics.WMS_Adapter.config.RabbitMqConfig;
import com.swiftlogistics.WMS_Adapter.dto.OrderCreatedEvent;
import com.swiftlogistics.WMS_Adapter.dto.PackageStoredEvent;
import com.swiftlogistics.WMS_Adapter.dto.WmsStoreResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class WmsIntegrationService {
    private final WmsProtocolTranslator wmsProtocolTranslator;
    private final WmsTcpClient wmsTcpClient;
    private final WmsResponseParser wmsResponseParser;
    private final PackageStoredPublisher packageStoredPublisher;

    @RabbitListener(queues = RabbitMqConfig.ORDER_CREATED_QUEUE)
    public void onOrderCreated(OrderCreatedEvent event) {
        log.info(
                "WMS received OrderCreated event: orderNumber={}, clientId={}, senderAddress={}, recipientAddress={}, weight={}, status={}",
                event.getOrderNumber(),
                event.getClientId(),
                event.getSenderAddress(),
                event.getRecipientAddress(),
                event.getWeight(),
                event.getStatus()
        );

        String storeMessage = wmsProtocolTranslator.toStoreMessage(event);
        log.info("Translated order {} to WMS protocol: {}", event.getOrderNumber(), storeMessage);

        String response = wmsTcpClient.sendMessage(storeMessage);
        log.info("WMS TCP response for order {}: {}", event.getOrderNumber(), response);

        WmsStoreResponse storeResponse = wmsResponseParser.parseStoreResponse(response);
        if (!event.getOrderNumber().equals(storeResponse.getOrderNumber())) {
            throw new IllegalStateException("WMS response order number mismatch: expected "
                    + event.getOrderNumber() + " but received " + storeResponse.getOrderNumber());
        }

        PackageStoredEvent packageStoredEvent = PackageStoredEvent.builder()
                .orderNumber(storeResponse.getOrderNumber())
                .clientId(event.getClientId())
                .packageId(storeResponse.getPackageId())
                .status(storeResponse.getStatus())
                .warehouseLocation(storeResponse.getWarehouseLocation())
                .storedAt(LocalDateTime.now())
                .build();

        packageStoredPublisher.publish(packageStoredEvent);
        log.info("Order {} stored in WMS and PackageStored event published", event.getOrderNumber());
    }
}
