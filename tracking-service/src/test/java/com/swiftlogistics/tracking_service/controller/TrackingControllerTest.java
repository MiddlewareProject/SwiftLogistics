package com.swiftlogistics.tracking_service.controller;

import com.swiftlogistics.tracking_service.dto.DriverStatusUpdateRequest;
import com.swiftlogistics.tracking_service.dto.TrackingResponse;
import com.swiftlogistics.tracking_service.service.TrackingService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class TrackingControllerTest {
    private final TrackingService trackingService = mock(TrackingService.class);
    private final TrackingController controller = new TrackingController(trackingService);

    @Test
    void clientCannotAccessDriverManifest() {
        var response = controller.getDriverDashboard("1", "client@example.com", "CLIENT");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(trackingService, never()).getDriverPackages("client@example.com");
    }

    @Test
    void missingDriverAuthenticationCannotAccessManifest() {
        var response = controller.getDriverDashboard(null, null, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void clientCannotUseDriverStatusEndpoint() {
        DriverStatusUpdateRequest request = new DriverStatusUpdateRequest();
        request.setStatus("OUT_FOR_DELIVERY");

        var response = controller.updateDriverStatus("SL-1", "client@example.com", "CLIENT", request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(trackingService, never()).updateDriverStatus(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any()
        );
    }

    @Test
    void driverStatusEndpointUsesAuthenticatedUsername() {
        DriverStatusUpdateRequest request = new DriverStatusUpdateRequest();
        request.setStatus("OUT_FOR_DELIVERY");
        org.mockito.Mockito.when(trackingService.updateDriverStatus("SL-1", "DRV-01", request))
                .thenReturn(TrackingResponse.builder().orderNumber("SL-1").status("OUT_FOR_DELIVERY").build());

        var response = controller.updateDriverStatus("SL-1", "DRV-01", "DRIVER", request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(trackingService).updateDriverStatus("SL-1", "DRV-01", request);
    }

    @Test
    void clientCannotAccessDriverHistory() {
        var response = controller.getDriverHistory("client@example.com", "CLIENT");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(trackingService, never()).getDriverHistory("client@example.com");
    }

    @Test
    void driverHistoryUsesAuthenticatedUsername() {
        org.mockito.Mockito.when(trackingService.getDriverHistory("DRV-01")).thenReturn(java.util.List.of());

        var response = controller.getDriverHistory("DRV-01", "DRIVER");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(trackingService).getDriverHistory("DRV-01");
    }
}
