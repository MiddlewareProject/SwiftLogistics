package com.swiftlogistics.WMS_Adapter.service;

import com.swiftlogistics.WMS_Adapter.dto.WmsStoreResponse;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class WmsResponseParserTest {
    private final WmsResponseParser parser = new WmsResponseParser();

    @Test
    void parsesValidAckResponse() {
        WmsStoreResponse response = parser.parseStoreResponse("ACK|SL-PHASE4-001|PKG-123ABC|WAREHOUSE|A-12");

        assertThat(response.getOrderNumber()).isEqualTo("SL-PHASE4-001");
        assertThat(response.getPackageId()).isEqualTo("PKG-123ABC");
        assertThat(response.getStatus()).isEqualTo("WAREHOUSE");
        assertThat(response.getWarehouseLocation()).isEqualTo("A-12");
    }

    @Test
    void throwsClearExceptionForErrorResponse() {
        assertThatThrownBy(() -> parser.parseStoreResponse("ERR|INVALID_MESSAGE"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("WMS returned error response")
                .hasMessageContaining("ERR|INVALID_MESSAGE");
    }

    @Test
    void throwsClearExceptionForMalformedAckResponse() {
        assertThatThrownBy(() -> parser.parseStoreResponse("ACK|SL-ONLY"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Malformed WMS ACK response");
    }
}
