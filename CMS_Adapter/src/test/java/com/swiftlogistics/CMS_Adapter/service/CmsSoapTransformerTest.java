package com.swiftlogistics.CMS_Adapter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swiftlogistics.CMS_Adapter.dto.CmsSoapResponse;
import com.swiftlogistics.CMS_Adapter.dto.OrderCreatedEvent;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class CmsSoapTransformerTest {
    private final CmsSoapTransformer transformer = new CmsSoapTransformer(new ObjectMapper());

    @Test
    void buildsSoapXmlFromOrderEvent() {
        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderNumber("SL-10000001")
                .clientId(42L)
                .description("Inventory refresh")
                .senderAddress("Boston")
                .recipientAddress("Colombo")
                .weight(14.5)
                .status("PENDING")
                .createdAt(LocalDateTime.of(2026, 8, 3, 10, 30))
                .build();

        String soap = transformer.toSoapXml(event);

        assertThat(soap).contains("<OrderNumber>SL-10000001</OrderNumber>");
        assertThat(soap).contains("<RecipientAddress>Colombo</RecipientAddress>");
    }

    @Test
    void parsesCmsSoapResponseXml() {
        String soapResponse = """
                <soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">
                  <soap:Body>
                    <SubmitOrderResponse>
                      <OrderNumber>SL-10000001</OrderNumber>
                      <Status>APPROVED</Status>
                      <Message>CMS accepted order SL-10000001</Message>
                      <ProcessedAt>2026-08-03T10:31:00</ProcessedAt>
                    </SubmitOrderResponse>
                  </soap:Body>
                </soap:Envelope>
                """;

        CmsSoapResponse response = transformer.fromSoapXml(soapResponse);

        assertThat(response.getOrderNumber()).isEqualTo("SL-10000001");
        assertThat(response.getStatus()).isEqualTo("APPROVED");
        assertThat(response.getMessage()).contains("CMS accepted order");
    }
}