package com.swiftlogistics.WMS_Adapter.service;

import com.swiftlogistics.WMS_Adapter.dto.WmsTcpStatusResponse;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WmsTcpStatusServiceTest {

    @Test
    void defaultsToUnknownBeforeTcpAttempts() {
        WmsTcpStatusService service = new WmsTcpStatusService();

        WmsTcpStatusResponse status = service.getStatus("localhost", 9095);

        assertThat(status.getStatus()).isEqualTo("UNKNOWN");
        assertThat(status.getHost()).isEqualTo("localhost");
        assertThat(status.getPort()).isEqualTo(9095);
        assertThat(status.getLastSuccessfulAt()).isNull();
        assertThat(status.getLastFailureAt()).isNull();
        assertThat(status.getLastError()).isNull();
    }

    @Test
    void recordsSuccessfulTcpCommunicationAsOnline() {
        WmsTcpStatusService service = new WmsTcpStatusService();

        service.recordSuccess();
        WmsTcpStatusResponse status = service.getStatus("wms", 9095);

        assertThat(status.getStatus()).isEqualTo("ONLINE");
        assertThat(status.getLastSuccessfulAt()).isNotNull();
        assertThat(status.getLastError()).isNull();
    }

    @Test
    void recordsFailedTcpCommunicationAsOffline() {
        WmsTcpStatusService service = new WmsTcpStatusService();

        service.recordFailure("Connection refused");
        WmsTcpStatusResponse status = service.getStatus("wms", 9095);

        assertThat(status.getStatus()).isEqualTo("OFFLINE");
        assertThat(status.getLastFailureAt()).isNotNull();
        assertThat(status.getLastError()).isEqualTo("Connection refused");
    }
}
