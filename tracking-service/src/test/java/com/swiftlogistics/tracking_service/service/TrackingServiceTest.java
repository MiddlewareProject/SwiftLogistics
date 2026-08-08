package com.swiftlogistics.tracking_service.service;

import com.swiftlogistics.tracking_service.dto.PackageStoredEvent;
import com.swiftlogistics.tracking_service.dto.StatusUpdateRequest;
import com.swiftlogistics.tracking_service.dto.TrackingResponse;
import com.swiftlogistics.tracking_service.dto.TrackingUpdatedEvent;
import com.swiftlogistics.tracking_service.exception.InvalidTrackingStatusException;
import com.swiftlogistics.tracking_service.exception.TrackingNotFoundException;
import com.swiftlogistics.tracking_service.model.PackageTracking;
import com.swiftlogistics.tracking_service.model.TrackingHistory;
import com.swiftlogistics.tracking_service.repository.PackageTrackingRepository;
import com.swiftlogistics.tracking_service.repository.TrackingHistoryRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TrackingServiceTest {
    private final PackageTrackingRepository packageTrackingRepository = mock(PackageTrackingRepository.class);
    private final TrackingHistoryRepository trackingHistoryRepository = mock(TrackingHistoryRepository.class);
    private final TrackingUpdatedPublisher trackingUpdatedPublisher = mock(TrackingUpdatedPublisher.class);
    private final TrackingService trackingService = new TrackingService(
            packageTrackingRepository,
            trackingHistoryRepository,
            trackingUpdatedPublisher
    );

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

    @Test
    void warehouseToLoadedSucceedsAndPublishesTrackingUpdated() {
        assertSuccessfulTransition("WAREHOUSE", "LOADED", "Dock 2", "Package loaded onto delivery vehicle");
    }

    @Test
    void loadedToOutForDeliverySucceeds() {
        assertSuccessfulTransition("LOADED", "OUT_FOR_DELIVERY", "Vehicle 42", "Package is out for delivery");
    }

    @Test
    void outForDeliveryToDeliveredSucceeds() {
        assertSuccessfulTransition("OUT_FOR_DELIVERY", "DELIVERED", "Customer address", "Package delivered successfully");
    }

    @Test
    void outForDeliveryToFailedSucceeds() {
        assertSuccessfulTransition("OUT_FOR_DELIVERY", "FAILED", "Customer address", "Delivery attempt failed");
    }

    @Test
    void warehouseToDeliveredIsRejected() {
        PackageTracking tracking = packageTracking("WAREHOUSE", "A-12");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));

        assertThatThrownBy(() -> trackingService.updateStatus(tracking.getOrderNumber(), statusRequest("DELIVERED", "Customer address", null)))
                .isInstanceOf(InvalidTrackingStatusException.class)
                .hasMessageContaining("Invalid tracking status transition")
                .hasMessageContaining("WAREHOUSE -> DELIVERED");

        assertThat(tracking.getStatus()).isEqualTo("WAREHOUSE");
        verify(packageTrackingRepository, never()).save(any(PackageTracking.class));
        verify(trackingHistoryRepository, never()).save(any(TrackingHistory.class));
        verify(trackingUpdatedPublisher, never()).publish(any(TrackingUpdatedEvent.class));
    }

    @Test
    void deliveredToLoadedIsRejected() {
        PackageTracking tracking = packageTracking("DELIVERED", "Customer address");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));

        assertThatThrownBy(() -> trackingService.updateStatus(tracking.getOrderNumber(), statusRequest("LOADED", "Dock 2", null)))
                .isInstanceOf(InvalidTrackingStatusException.class)
                .hasMessageContaining("Invalid tracking status transition")
                .hasMessageContaining("DELIVERED -> LOADED");

        assertThat(tracking.getStatus()).isEqualTo("DELIVERED");
        verify(packageTrackingRepository, never()).save(any(PackageTracking.class));
        verify(trackingHistoryRepository, never()).save(any(TrackingHistory.class));
        verify(trackingUpdatedPublisher, never()).publish(any(TrackingUpdatedEvent.class));
    }

    @Test
    void duplicateSameStatusUpdateDoesNotCreateHistoryOrPublish() {
        PackageTracking tracking = packageTracking("WAREHOUSE", "A-12");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));
        when(trackingHistoryRepository.findByOrderNumberOrderByEventTimeAsc(tracking.getOrderNumber())).thenReturn(List.of());

        TrackingResponse response = trackingService.updateStatus(
                tracking.getOrderNumber(),
                statusRequest("warehouse", "A-12", "Duplicate update")
        );

        assertThat(response.getStatus()).isEqualTo("WAREHOUSE");
        verify(packageTrackingRepository, never()).save(any(PackageTracking.class));
        verify(trackingHistoryRepository, never()).save(any(TrackingHistory.class));
        verify(trackingUpdatedPublisher, never()).publish(any(TrackingUpdatedEvent.class));
    }

    @Test
    void unknownStatusIsRejected() {
        PackageTracking tracking = packageTracking("WAREHOUSE", "A-12");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));

        assertThatThrownBy(() -> trackingService.updateStatus(tracking.getOrderNumber(), statusRequest("FLYING", "Sky", null)))
                .isInstanceOf(InvalidTrackingStatusException.class)
                .hasMessageContaining("Unknown tracking status: FLYING");

        verify(packageTrackingRepository, never()).save(any(PackageTracking.class));
        verify(trackingHistoryRepository, never()).save(any(TrackingHistory.class));
        verify(trackingUpdatedPublisher, never()).publish(any(TrackingUpdatedEvent.class));
    }

    @Test
    void unknownOrderProducesNotFoundResult() {
        when(packageTrackingRepository.findByOrderNumber("SL-MISSING")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> trackingService.getTracking("SL-MISSING"))
                .isInstanceOf(TrackingNotFoundException.class)
                .hasMessageContaining("No tracking record found for order SL-MISSING");
    }

    @Test
    void getTrackingMapsHistoryInEventTimeAscendingOrder() {
        PackageTracking tracking = packageTracking("OUT_FOR_DELIVERY", "Vehicle 42");
        LocalDateTime storedAt = LocalDateTime.of(2026, 8, 8, 10, 30);
        LocalDateTime loadedAt = LocalDateTime.of(2026, 8, 8, 11, 30);
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));
        when(trackingHistoryRepository.findByOrderNumberOrderByEventTimeAsc(tracking.getOrderNumber()))
                .thenReturn(List.of(
                        history("WAREHOUSE", "A-12", "Package stored in warehouse", storedAt),
                        history("LOADED", "Vehicle 42", "Package loaded onto delivery vehicle", loadedAt)
                ));

        TrackingResponse response = trackingService.getTracking(tracking.getOrderNumber());

        assertThat(response.getOrderNumber()).isEqualTo(tracking.getOrderNumber());
        assertThat(response.getStatus()).isEqualTo("OUT_FOR_DELIVERY");
        assertThat(response.getHistory()).hasSize(2);
        assertThat(response.getHistory().get(0).getStatus()).isEqualTo("WAREHOUSE");
        assertThat(response.getHistory().get(0).getEventTime()).isEqualTo(storedAt);
        assertThat(response.getHistory().get(1).getStatus()).isEqualTo("LOADED");
        assertThat(response.getHistory().get(1).getEventTime()).isEqualTo(loadedAt);
    }

    private void assertSuccessfulTransition(String currentStatus, String requestedStatus, String location, String expectedDescription) {
        PackageTracking tracking = packageTracking(currentStatus, "A-12");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));
        when(trackingHistoryRepository.findByOrderNumberOrderByEventTimeAsc(tracking.getOrderNumber())).thenReturn(List.of());

        TrackingResponse response = trackingService.updateStatus(
                tracking.getOrderNumber(),
                statusRequest(requestedStatus.toLowerCase(), location, null)
        );

        assertThat(response.getStatus()).isEqualTo(requestedStatus);
        assertThat(tracking.getStatus()).isEqualTo(requestedStatus);
        assertThat(tracking.getCurrentLocation()).isEqualTo(location);

        ArgumentCaptor<TrackingHistory> historyCaptor = ArgumentCaptor.forClass(TrackingHistory.class);
        verify(trackingHistoryRepository).save(historyCaptor.capture());
        TrackingHistory history = historyCaptor.getValue();
        assertThat(history.getStatus()).isEqualTo(requestedStatus);
        assertThat(history.getLocation()).isEqualTo(location);
        assertThat(history.getDescription()).isEqualTo(expectedDescription);

        ArgumentCaptor<TrackingUpdatedEvent> eventCaptor = ArgumentCaptor.forClass(TrackingUpdatedEvent.class);
        verify(trackingUpdatedPublisher).publish(eventCaptor.capture());
        TrackingUpdatedEvent event = eventCaptor.getValue();
        assertThat(event.getOrderNumber()).isEqualTo(tracking.getOrderNumber());
        assertThat(event.getPackageId()).isEqualTo(tracking.getPackageId());
        assertThat(event.getStatus()).isEqualTo(requestedStatus);
        assertThat(event.getLocation()).isEqualTo(location);
        assertThat(event.getDescription()).isEqualTo(expectedDescription);
    }

    private PackageTracking packageTracking(String status, String location) {
        LocalDateTime createdAt = LocalDateTime.of(2026, 8, 8, 10, 30);
        return PackageTracking.builder()
                .orderNumber("SL-PHASE6-001")
                .clientId(4L)
                .packageId("PKG-123ABC")
                .status(status)
                .currentLocation(location)
                .createdAt(createdAt)
                .updatedAt(createdAt)
                .build();
    }

    private TrackingHistory history(String status, String location, String description, LocalDateTime eventTime) {
        return TrackingHistory.builder()
                .orderNumber("SL-PHASE6-001")
                .packageId("PKG-123ABC")
                .status(status)
                .location(location)
                .description(description)
                .eventTime(eventTime)
                .build();
    }

    private StatusUpdateRequest statusRequest(String status, String location, String description) {
        StatusUpdateRequest request = new StatusUpdateRequest();
        request.setStatus(status);
        request.setLocation(location);
        request.setDescription(description);
        return request;
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
