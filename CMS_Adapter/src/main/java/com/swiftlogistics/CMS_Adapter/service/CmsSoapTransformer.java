package com.swiftlogistics.CMS_Adapter.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.swiftlogistics.CMS_Adapter.dto.CmsSoapResponse;
import com.swiftlogistics.CMS_Adapter.dto.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class CmsSoapTransformer {
    private final ObjectMapper objectMapper;

    public String toSoapXml(OrderCreatedEvent event) {
        String description = sanitize(event.getDescription());
        String senderAddress = sanitize(event.getSenderAddress());
        String recipientAddress = sanitize(event.getRecipientAddress());

        return """
                <soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">
                  <soap:Body>
                    <SubmitOrderRequest>
                      <OrderNumber>%s</OrderNumber>
                      <ClientId>%s</ClientId>
                      <Description>%s</Description>
                      <SenderAddress>%s</SenderAddress>
                      <RecipientAddress>%s</RecipientAddress>
                      <Weight>%s</Weight>
                      <Status>%s</Status>
                      <CreatedAt>%s</CreatedAt>
                    </SubmitOrderRequest>
                  </soap:Body>
                </soap:Envelope>
                """.formatted(
                sanitize(event.getOrderNumber()),
                event.getClientId(),
                description,
                senderAddress,
                recipientAddress,
                event.getWeight(),
                sanitize(event.getStatus()),
                event.getCreatedAt()
        ).strip();
    }

    public CmsSoapResponse fromSoapXml(String soapXml) {
        return CmsSoapResponse.builder()
                .orderNumber(extractTagValue(soapXml, "OrderNumber"))
                .status(extractTagValue(soapXml, "Status"))
                .message(extractTagValue(soapXml, "Message"))
                .processedAt(parseTimestamp(extractTagValue(soapXml, "ProcessedAt")))
                .build();
    }

    public String toJson(CmsSoapResponse response) {
        try {
            return objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to convert CMS response to JSON", exception);
        }
    }

    private String extractTagValue(String xml, String tagName) {
        String openingTag = "<" + tagName + ">";
        String closingTag = "</" + tagName + ">";
        int start = xml.indexOf(openingTag);
        int end = xml.indexOf(closingTag);
        if (start < 0 || end < 0 || end <= start) {
            return null;
        }
        return xml.substring(start + openingTag.length(), end).trim();
    }

    private LocalDateTime parseTimestamp(String timestamp) {
        if (timestamp == null || timestamp.isBlank()) {
            return null;
        }
        return LocalDateTime.parse(timestamp);
    }

    private String sanitize(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}