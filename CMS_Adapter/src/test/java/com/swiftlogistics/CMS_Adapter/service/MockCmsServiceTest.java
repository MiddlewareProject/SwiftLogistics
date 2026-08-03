package com.swiftlogistics.CMS_Adapter.service;

import com.swiftlogistics.CMS_Adapter.exception.CmsIntegrationException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;

class MockCmsServiceTest {
    private final MockCmsService mockCmsService = new MockCmsService();

    @Test
    void returnsSoapResponseForNormalRequest() {
        String request = """
                <soap:Envelope>
                  <soap:Body>
                    <SubmitOrderRequest>
                      <OrderNumber>SL-10000001</OrderNumber>
                      <Description>Inventory refresh</Description>
                    </SubmitOrderRequest>
                  </soap:Body>
                </soap:Envelope>
                """;

        String response = mockCmsService.processSoapRequest(request);

        assertThat(response).contains("<Status>APPROVED</Status>");
    }

    @Test
    void rejectsMarkedFailureRequests() {
        String request = """
                <soap:Envelope>
                  <soap:Body>
                    <SubmitOrderRequest>
                      <OrderNumber>SL-10000001</OrderNumber>
                      <Description>FAIL_CMS</Description>
                    </SubmitOrderRequest>
                  </soap:Body>
                </soap:Envelope>
                """;

        assertThatThrownBy(() -> mockCmsService.processSoapRequest(request))
                .isInstanceOf(CmsIntegrationException.class);
    }
}