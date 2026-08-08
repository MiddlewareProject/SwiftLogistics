package com.swiftlogistics.tracking_service.service;

import com.swiftlogistics.tracking_service.dto.PackageStoredEvent;
import com.swiftlogistics.tracking_service.model.PackageTracking;
import com.swiftlogistics.tracking_service.model.TrackingHistory;
import com.swiftlogistics.tracking_service.repository.PackageTrackingRepository;
import com.swiftlogistics.tracking_service.repository.TrackingHistoryRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TrackingServiceTest {
    private final PackageTrackingRepository packageTrackingRepository = mock(PackageTrackingRepository.class);
    private final TrackingHistoryRepository trackingHistoryRepository = mock(TrackingHistoryRepository.class);
    private final TrackingService trackingService = new TrackingService(packageTrackingRepository, trackingHistoryRepository);

    @Test
    void handlesNewPackageStoredEvent() {
        PackageStoredEvent event = packageStoredEvent();
        when(packageTrackingRepository.findByOrderNumber(event.getOrderNumber())).thenReturn(Optional.empty());

        trackingService.handlePackageStored(event);

        ArgumentCaptor<PackageTracking> trackingCaptor = ArgumentCaptor.forClass(PackageTracking.class);
        verify(packageTrackingRepository).save(trackingCaptor.capture());
        PackageTracking tracking = trackingCaptor.getValue();
        assertThat(tracking.getOrderNumber()).isEqualTo("SL-PHASE5-001");
        assertThat(tracking.getPackageId()).isEqualTo("PKG-123ABC");
        assertThat(tracking.getStatus()).isEqualTo("WAREHOUSE");
        assertThat(tracking.getCurrentLocation()).isEqualTo("A-12");

        ArgumentCaptor<TrackingHistory> historyCaptor = ArgumentCaptor.forClass(TrackingHistory.class);
        verify(trackingHistoryRepository).save(historyCaptor.capture());
        TrackingHistory history = historyCaptor.getValue();
        assertThat(history.getOrderNumber()).isEqualTo("SL-PHASE5-001");
        assertThat(history.getPackageId()).isEqualTo("PKG-123ABC");
        assertThat(history.getStatus()).isEqualTo("WAREHOUSE");
        assertThat(history.getLocation()).isEqualTo("A-12");
        assertThat(history.getDescription()).isEqualTo("Package stored in warehouse");
    }

    @Test
    void ignoresDuplicatePackageStoredEvent() {
        PackageStoredEvent event = packageStoredEvent();
        PackageTracking existing = PackageTracking.builder()
                .orderNumber(event.getOrderNumber())
                .clientId(event.getClientId())
                .packageId(event.getPackageId())
                .status(event.getStatus())
                .currentLocation(event.getWarehouseLocation())
                .createdAt(event.getStoredAt())
                .updatedAt(event.getStoredAt())
                .build();
        when(packageTrackingRepository.findByOrderNumber(event.getOrderNumber())).thenReturn(Optional.of(existing));

        trackingService.handlePackageStored(event);

        verify(packageTrackingRepository, never()).save(org.mockito.ArgumentMatchers.any(PackageTracking.class));
        verify(trackingHistoryRepository, never()).save(org.mockito.ArgumentMatchers.any(TrackingHistory.class));
    }

    @Test
    void rejectsConflictingPackageIdForExistingOrder() {
        PackageStoredEvent event = packageStoredEvent();
        PackageTracking existing = PackageTracking.builder()
                .orderNumber(event.getOrderNumber())
                .clientId(event.getClientId())
                .packageId("PKG-DIFFERENT")
                .status(event.getStatus())
                .currentLocation(event.getWarehouseLocation())
                .createdAt(event.getStoredAt())
                .updatedAt(event.getStoredAt())
                .build();
        when(packageTrackingRepository.findByOrderNumber(event.getOrderNumber())).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> trackingService.handlePackageStored(event))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Conflicting PackageStored event")
                .hasMessageContaining("PKG-DIFFERENT")
                .hasMessageContaining("PKG-123ABC");

        verify(packageTrackingRepository, never()).save(org.mockito.ArgumentMatchers.any(PackageTracking.class));
        verify(trackingHistoryRepository, never()).save(org.mockito.ArgumentMatchers.any(TrackingHistory.class));
    }

    private PackageStoredEvent packageStoredEvent() {
        return PackageStoredEvent.builder()
                .orderNumber("SL-PHASE5-001")
                .clientId(4L)
                .packageId("PKG-123ABC")
                .status("WAREHOUSE")
                .warehouseLocation("A-12")
                .storedAt(LocalDateTime.of(2026, 8, 8, 10, 30))
                .build();
    }
}
