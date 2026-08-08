package com.swiftlogistics.WMS_Adapter.service;

import com.swiftlogistics.WMS_Adapter.dto.OrderCreatedEvent;
import org.springframework.stereotype.Service;

@Service
public class WmsProtocolTranslator {

    public String toStoreMessage(OrderCreatedEvent event) {
        return String.join("|",
                "STORE",
                sanitize(event.getOrderNumber()),
                String.valueOf(event.getClientId()),
                sanitize(event.getSenderAddress()),
                sanitize(event.getRecipientAddress()),
                String.valueOf(event.getWeight()),
                sanitize(event.getStatus())
        );
    }

    private String sanitize(String value) {
        if (value == null) {
            return "";
        }

        return value.replace("|", "/");
    }
}
