package com.swiftlogistics.WMS_Adapter.service;

import com.swiftlogistics.WMS_Adapter.dto.OrderCreatedEvent;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WmsProtocolTranslatorTest {
    private final WmsProtocolTranslator translator = new WmsProtocolTranslator();

    @Test
    void buildsStoreMessageFromOrderEvent() {
        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderNumber("SL-PHASE2-001")
                .clientId(4L)
                .senderAddress("Colombo")
                .recipientAddress("Kandy")
                .weight(2.5)
                .status("PENDING")
                .build();

        String message = translator.toStoreMessage(event);

        assertThat(message).isEqualTo("STORE|SL-PHASE2-001|4|Colombo|Kandy|2.5|PENDING");
    }

    @Test
    void sanitizesFieldSeparatorsInStringFields() {
        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderNumber("SL|PHASE2|001")
                .clientId(4L)
                .senderAddress("Colombo|Fort")
                .recipientAddress("Kandy|Central")
                .weight(2.5)
                .status("PENDING|REVIEW")
                .build();

        String message = translator.toStoreMessage(event);

        assertThat(message).isEqualTo("STORE|SL/PHASE2/001|4|Colombo/Fort|Kandy/Central|2.5|PENDING/REVIEW");
    }
}
