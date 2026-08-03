package com.swiftlogistics.CMS_Adapter.service;

import com.swiftlogistics.CMS_Adapter.exception.CmsIntegrationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MockCmsService {
    public String processSoapRequest(String soapRequest) {
        String orderNumber = extractTagValue(soapRequest, "OrderNumber");
        String description = extractTagValue(soapRequest, "Description");

        if (description != null && description.toUpperCase().contains("FAIL_CMS")) {
            throw new CmsIntegrationException("Mock CMS rejected order " + orderNumber + " for demo failure");
        }

        return """
                <soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">
                  <soap:Body>
                    <SubmitOrderResponse>
                      <OrderNumber>%s</OrderNumber>
                      <Status>APPROVED</Status>
                      <Message>CMS accepted order %s</Message>
                      <ProcessedAt>%s</ProcessedAt>
                    </SubmitOrderResponse>
                  </soap:Body>
                </soap:Envelope>
                """.formatted(orderNumber, orderNumber, LocalDateTime.now()).strip();
    }

    public boolean isHealthy() {
        return true;
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
}