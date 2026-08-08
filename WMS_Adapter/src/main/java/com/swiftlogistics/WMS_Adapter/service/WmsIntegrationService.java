package com.swiftlogistics.WMS_Adapter.service;

import com.swiftlogistics.WMS_Adapter.config.RabbitMqConfig;
import com.swiftlogistics.WMS_Adapter.dto.OrderCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class WmsIntegrationService {

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
    }
}
