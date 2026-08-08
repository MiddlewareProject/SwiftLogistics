package com.swiftlogistics.WMS_Adapter.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MockWmsTcpServerTest {
    private final MockWmsTcpServer server = new MockWmsTcpServer(9095);

    @Test
    void validStoreRequestProducesAckResponse() {
        String response = server.processMessage("STORE|SL-PHASE3-001|4|Colombo|Kandy|2.5|PENDING");

        String[] fields = response.split("\\|");
        assertThat(fields).hasSize(5);
        assertThat(fields[0]).isEqualTo("ACK");
        assertThat(fields[1]).isEqualTo("SL-PHASE3-001");
        assertThat(fields[2]).startsWith("PKG-");
        assertThat(fields[3]).isEqualTo("WAREHOUSE");
        assertThat(fields[4]).isNotBlank();
    }

    @Test
    void malformedMessageProducesInvalidMessageResponse() {
        String response = server.processMessage("STORE|SL-PHASE3-001|4");

        assertThat(response).isEqualTo("ERR|INVALID_MESSAGE");
    }

    @Test
    void unsupportedCommandProducesUnsupportedCommandResponse() {
        String response = server.processMessage("UPDATE|SL-PHASE3-001|4|Colombo|Kandy|2.5|PENDING");

        assertThat(response).isEqualTo("ERR|UNSUPPORTED_COMMAND");
    }
}
