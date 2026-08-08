package com.swiftlogistics.WMS_Adapter.service;

import com.swiftlogistics.WMS_Adapter.config.RabbitMqConfig;
import com.swiftlogistics.WMS_Adapter.dto.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WmsIntegrationService {
    private final WmsProtocolTranslator wmsProtocolTranslator;

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
    }
}
