package com.swiftlogistics.tracking_service.service;

import com.swiftlogistics.tracking_service.dto.PackageStoredEvent;
import com.swiftlogistics.tracking_service.dto.DriverStatusUpdateRequest;
import com.swiftlogistics.tracking_service.dto.RouteGeneratedEvent;
import com.swiftlogistics.tracking_service.dto.StatusUpdateRequest;
import com.swiftlogistics.tracking_service.dto.TrackingResponse;
import com.swiftlogistics.tracking_service.dto.TrackingUpdatedEvent;
import com.swiftlogistics.tracking_service.dto.WarehouseDashboardResponse;
import com.swiftlogistics.tracking_service.exception.DriverAccessDeniedException;
import com.swiftlogistics.tracking_service.exception.InvalidTrackingStatusException;
import com.swiftlogistics.tracking_service.exception.TrackingNotFoundException;
import com.swiftlogistics.tracking_service.model.DeliveryProof;
import com.swiftlogistics.tracking_service.model.FailedDelivery;
import com.swiftlogistics.tracking_service.model.PackageTracking;
import com.swiftlogistics.tracking_service.model.PendingDriverAssignment;
import com.swiftlogistics.tracking_service.model.TrackingHistory;
import com.swiftlogistics.tracking_service.repository.DeliveryProofRepository;
import com.swiftlogistics.tracking_service.repository.FailedDeliveryRepository;
import com.swiftlogistics.tracking_service.repository.PackageTrackingRepository;
import com.swiftlogistics.tracking_service.repository.PendingDriverAssignmentRepository;
import com.swiftlogistics.tracking_service.repository.TrackingHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TrackingServiceTest {
    private final PackageTrackingRepository packageTrackingRepository = mock(PackageTrackingRepository.class);
    private final TrackingHistoryRepository trackingHistoryRepository = mock(TrackingHistoryRepository.class);
    private final DeliveryProofRepository deliveryProofRepository = mock(DeliveryProofRepository.class);
    private final FailedDeliveryRepository failedDeliveryRepository = mock(FailedDeliveryRepository.class);
    private final PendingDriverAssignmentRepository pendingDriverAssignmentRepository = mock(PendingDriverAssignmentRepository.class);
    private final TrackingUpdatedPublisher trackingUpdatedPublisher = mock(TrackingUpdatedPublisher.class);
    private final Clock clock = Clock.fixed(Instant.parse("2026-08-18T04:30:00Z"), ZoneId.of("Asia/Colombo"));
    private final TrackingService trackingService = new TrackingService(
            packageTrackingRepository,
            trackingHistoryRepository,
            deliveryProofRepository,
            failedDeliveryRepository,
            pendingDriverAssignmentRepository,
            trackingUpdatedPublisher,
            clock
    );

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(trackingService, "warehouseCapacity", 25L);
        ReflectionTestUtils.setField(trackingService, "appTimezone", "Asia/Colombo");
        ReflectionTestUtils.setField(trackingService, "sourceEventTimezone", "UTC");
    }

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

    @Test
    void warehouseDashboardUsesCurrentTrackingDataAndRecentHistory() {
        LocalDateTime oldest = LocalDateTime.of(2026, 8, 8, 9, 0);
        LocalDateTime newest = LocalDateTime.of(2026, 8, 8, 12, 0);
        PackageTracking newestPackage = packageTracking("WAREHOUSE", "A-12");
        newestPackage.setOrderNumber("SL-NEWEST");
        newestPackage.setUpdatedAt(newest);
        PackageTracking olderPackage = packageTracking("DELIVERED", "Customer address");
        olderPackage.setOrderNumber("SL-OLDER");
        olderPackage.setUpdatedAt(oldest);

        TrackingHistory latestHistory = history("LOADED", "Dock 2", "Package loaded onto delivery vehicle", newest);
        latestHistory.setOrderNumber("SL-NEWEST");
        TrackingHistory olderHistory = history("WAREHOUSE", "A-12", "Package stored in warehouse", oldest);
        olderHistory.setOrderNumber("SL-OLDER");

        when(packageTrackingRepository.count()).thenReturn(6L);
        when(packageTrackingRepository.countByStatus("WAREHOUSE")).thenReturn(2L);
        when(packageTrackingRepository.countByStatus("LOADED")).thenReturn(1L);
        when(packageTrackingRepository.countByStatus("OUT_FOR_DELIVERY")).thenReturn(1L);
        when(packageTrackingRepository.countByStatus("DELIVERED")).thenReturn(1L);
        when(packageTrackingRepository.countByStatus("FAILED")).thenReturn(1L);
        when(packageTrackingRepository.findAllByOrderByUpdatedAtDesc()).thenReturn(List.of(newestPackage, olderPackage));
        when(trackingHistoryRepository.findTop10ByOrderByEventTimeDesc()).thenReturn(List.of(latestHistory, olderHistory));

        WarehouseDashboardResponse dashboard = trackingService.getWarehouseDashboard();

        assertThat(dashboard.getStats().getReceived()).isEqualTo(6);
        assertThat(dashboard.getStats().getStored()).isEqualTo(2);
        assertThat(dashboard.getStats().getLoaded()).isEqualTo(1);
        assertThat(dashboard.getStats().getDelivered()).isEqualTo(1);
        assertThat(dashboard.getCapacity().getUsed()).isEqualTo(2);
        assertThat(dashboard.getCapacity().getTotal()).isEqualTo(25);
        assertThat(dashboard.getCapacity().getPercentage()).isEqualTo(8.0);
        assertThat(dashboard.getPackages()).extracting("orderNumber").containsExactly("SL-NEWEST", "SL-OLDER");
        assertThat(dashboard.getRecentActivity()).extracting("orderNumber").containsExactly("SL-NEWEST", "SL-OLDER");
    }

    @Test
    void warehouseDashboardHandlesZeroCapacitySafely() {
        ReflectionTestUtils.setField(trackingService, "warehouseCapacity", 0L);
        when(packageTrackingRepository.count()).thenReturn(1L);
        when(packageTrackingRepository.countByStatus("WAREHOUSE")).thenReturn(1L);
        when(packageTrackingRepository.findAllByOrderByUpdatedAtDesc()).thenReturn(List.of());
        when(trackingHistoryRepository.findTop10ByOrderByEventTimeDesc()).thenReturn(List.of());

        WarehouseDashboardResponse dashboard = trackingService.getWarehouseDashboard();

        assertThat(dashboard.getCapacity().getTotal()).isZero();
        assertThat(dashboard.getCapacity().getPercentage()).isZero();
    }

    @Test
    void routeGeneratedStoresDriverAssignmentData() {
        PackageTracking tracking = packageTracking("LOADED", "Dock 2");
        LocalDateTime generatedAt = LocalDateTime.of(2026, 8, 18, 9, 15);
        RouteGeneratedEvent event = RouteGeneratedEvent.builder()
                .orderNumber(tracking.getOrderNumber())
                .driverId("DRV-01")
                .driverName("Amal Perera")
                .routeId("RT-123")
                .vehicleId("VEH-01")
                .vehiclePlate("TRK-982")
                .distanceKm(12.4)
                .durationMinutes(38)
                .trafficLevel("LOW")
                .generatedAt(generatedAt)
                .build();
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));

        assertThat(trackingService.assignDriver(event)).isTrue();

        assertThat(tracking.getAssignedDriverId()).isEqualTo("DRV-01");
        assertThat(tracking.getDriverName()).isEqualTo("Amal Perera");
        assertThat(tracking.getVehiclePlate()).isEqualTo("TRK-982");
        assertThat(tracking.getDistanceKm()).isEqualTo(12.4);
        assertThat(tracking.getAssignmentTime()).isEqualTo(LocalDateTime.of(2026, 8, 18, 14, 45));
        verify(packageTrackingRepository).save(tracking);
    }

    @Test
    void driverManifestReturnsOnlyTodayForAuthenticatedDriver() {
        PackageTracking today = assignedPackage("DRV-01", "LOADED");
        today.setAssignmentTime(LocalDateTime.of(2026, 8, 18, 10, 0));
        when(packageTrackingRepository.findByAssignedDriverIdAndStatusInAndAssignmentTimeBetweenOrderByAssignmentTimeAsc(
                anyString(), any(), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(List.of(today));

        var packages = trackingService.getDriverPackages("DRV-01");

        assertThat(packages).hasSize(1);
        assertThat(packages.get(0).getDriverId()).isEqualTo("DRV-01");
        ArgumentCaptor<List<String>> statusesCaptor = ArgumentCaptor.forClass(List.class);
        ArgumentCaptor<LocalDateTime> startCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        ArgumentCaptor<LocalDateTime> endCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(packageTrackingRepository).findByAssignedDriverIdAndStatusInAndAssignmentTimeBetweenOrderByAssignmentTimeAsc(
                eq("DRV-01"),
                statusesCaptor.capture(),
                startCaptor.capture(),
                endCaptor.capture()
        );
        assertThat(statusesCaptor.getValue()).containsExactly("LOADED", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED");
        assertThat(startCaptor.getValue()).isEqualTo(LocalDateTime.of(2026, 8, 18, 0, 0));
        assertThat(endCaptor.getValue()).isEqualTo(LocalDateTime.of(2026, 8, 19, 0, 0));
    }

    @Test
    void routeGeneratedBeforePackageStoredCreatesPendingAssignmentAndPackageStoredAppliesIt() {
        RouteGeneratedEvent event = RouteGeneratedEvent.builder()
                .orderNumber("SL-PENDING-001")
                .clientId(8L)
                .driverId("DRV-01")
                .driverName("Amal Perera")
                .routeId("RT-PENDING")
                .vehicleId("VEH-01")
                .vehiclePlate("TRK-982")
                .distanceKm(11.0)
                .durationMinutes(25)
                .trafficLevel("MEDIUM")
                .generatedAt(LocalDateTime.of(2026, 8, 17, 20, 0))
                .build();
        when(packageTrackingRepository.findByOrderNumber("SL-PENDING-001")).thenReturn(Optional.empty());

        assertThat(trackingService.assignDriver(event)).isTrue();

        ArgumentCaptor<PendingDriverAssignment> pendingCaptor = ArgumentCaptor.forClass(PendingDriverAssignment.class);
        verify(pendingDriverAssignmentRepository).save(pendingCaptor.capture());
        PendingDriverAssignment pending = pendingCaptor.getValue();
        assertThat(pending.getOrderNumber()).isEqualTo("SL-PENDING-001");
        assertThat(pending.getDriverId()).isEqualTo("DRV-01");
        assertThat(pending.getGeneratedAt()).isEqualTo(LocalDateTime.of(2026, 8, 18, 1, 30));

        PackageTracking stored = PackageTracking.builder()
                .orderNumber("SL-PENDING-001")
                .clientId(8L)
                .packageId("PKG-PENDING")
                .status("WAREHOUSE")
                .currentLocation("A-1")
                .createdAt(LocalDateTime.of(2026, 8, 18, 1, 45))
                .updatedAt(LocalDateTime.of(2026, 8, 18, 1, 45))
                .build();
        when(packageTrackingRepository.findByOrderNumber("SL-PENDING-001")).thenReturn(Optional.empty(), Optional.of(stored));
        when(pendingDriverAssignmentRepository.findById("SL-PENDING-001")).thenReturn(Optional.of(pending));
        when(packageTrackingRepository.save(any(PackageTracking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        trackingService.handlePackageStored(PackageStoredEvent.builder()
                .orderNumber("SL-PENDING-001")
                .clientId(8L)
                .packageId("PKG-PENDING")
                .status("WAREHOUSE")
                .warehouseLocation("A-1")
                .storedAt(LocalDateTime.of(2026, 8, 18, 1, 45))
                .build());

        assertThat(stored.getAssignedDriverId()).isEqualTo("DRV-01");
        assertThat(stored.getRouteId()).isEqualTo("RT-PENDING");
        assertThat(stored.getAssignmentTime()).isEqualTo(LocalDateTime.of(2026, 8, 18, 1, 30));
        verify(pendingDriverAssignmentRepository).delete(pending);
    }

    @Test
    void driverHistoryReturnsOnlyTerminalDeliveriesForAuthenticatedDriver() {
        PackageTracking delivered = assignedPackage("DRV-01", "DELIVERED");
        when(packageTrackingRepository.findTop50ByAssignedDriverIdAndStatusInOrderByUpdatedAtDesc(
                eq("DRV-01"), any()
        )).thenReturn(List.of(delivered));

        var history = trackingService.getDriverHistory("DRV-01");

        assertThat(history).hasSize(1);
        assertThat(history.get(0).getDriverId()).isEqualTo("DRV-01");
        ArgumentCaptor<List<String>> statusesCaptor = ArgumentCaptor.forClass(List.class);
        verify(packageTrackingRepository).findTop50ByAssignedDriverIdAndStatusInOrderByUpdatedAtDesc(
                eq("DRV-01"),
                statusesCaptor.capture()
        );
        assertThat(statusesCaptor.getValue()).containsExactly("DELIVERED", "FAILED");
    }

    @Test
    void driverCannotUpdateAnotherDriversPackage() {
        PackageTracking tracking = assignedPackage("DRV-02", "LOADED");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));

        assertThatThrownBy(() -> trackingService.updateDriverStatus(
                tracking.getOrderNumber(),
                "DRV-01",
                driverStatusRequest("OUT_FOR_DELIVERY", "In transit", null, null)
        )).isInstanceOf(DriverAccessDeniedException.class);

        verify(packageTrackingRepository, never()).save(any(PackageTracking.class));
    }

    @Test
    void driverLoadedToOutForDeliverySucceeds() {
        PackageTracking tracking = assignedPackage("DRV-01", "LOADED");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));
        when(trackingHistoryRepository.findByOrderNumberOrderByEventTimeAsc(tracking.getOrderNumber())).thenReturn(List.of());

        TrackingResponse response = trackingService.updateDriverStatus(
                tracking.getOrderNumber(),
                "DRV-01",
                driverStatusRequest("OUT_FOR_DELIVERY", "In transit", null, null)
        );

        assertThat(response.getStatus()).isEqualTo("OUT_FOR_DELIVERY");
        assertThat(tracking.getStatus()).isEqualTo("OUT_FOR_DELIVERY");
    }

    @Test
    void invalidDriverStatusTransitionIsRejected() {
        PackageTracking tracking = assignedPackage("DRV-01", "LOADED");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));

        assertThatThrownBy(() -> trackingService.updateDriverStatus(
                tracking.getOrderNumber(),
                "DRV-01",
                driverStatusRequest("FAILED", "In transit", "Customer unavailable", null)
        )).isInstanceOf(InvalidTrackingStatusException.class)
                .hasMessageContaining("Invalid driver tracking status transition");

        assertThat(tracking.getStatus()).isEqualTo("LOADED");
        verify(failedDeliveryRepository, never()).save(any(FailedDelivery.class));
    }

    @Test
    void failedDeliveryRequiresReasonAndStoresStructuredRecord() {
        PackageTracking tracking = assignedPackage("DRV-01", "OUT_FOR_DELIVERY");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));
        when(trackingHistoryRepository.findByOrderNumberOrderByEventTimeAsc(tracking.getOrderNumber())).thenReturn(List.of());

        assertThatThrownBy(() -> trackingService.updateDriverStatus(
                tracking.getOrderNumber(),
                "DRV-01",
                driverStatusRequest("FAILED", "Customer address", "", null)
        )).isInstanceOf(InvalidTrackingStatusException.class)
                .hasMessageContaining("Failure reason is required");

        TrackingResponse response = trackingService.updateDriverStatus(
                tracking.getOrderNumber(),
                "DRV-01",
                driverStatusRequest("FAILED", "Customer address", "Customer unavailable", "Gate locked")
        );

        assertThat(response.getStatus()).isEqualTo("FAILED");
        ArgumentCaptor<FailedDelivery> failedCaptor = ArgumentCaptor.forClass(FailedDelivery.class);
        verify(failedDeliveryRepository).save(failedCaptor.capture());
        assertThat(failedCaptor.getValue().getReason()).isEqualTo("Customer unavailable");
        assertThat(failedCaptor.getValue().getNote()).isEqualTo("Gate locked");
    }

    @Test
    void directDeliveryCompletionWithoutProofIsRejected() {
        PackageTracking tracking = assignedPackage("DRV-01", "OUT_FOR_DELIVERY");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));
        when(deliveryProofRepository.existsByOrderNumber(tracking.getOrderNumber())).thenReturn(false);

        assertThatThrownBy(() -> trackingService.updateDriverStatus(
                tracking.getOrderNumber(),
                "DRV-01",
                driverStatusRequest("DELIVERED", "Customer address", null, null)
        )).isInstanceOf(InvalidTrackingStatusException.class)
                .hasMessageContaining("Proof of Delivery is required");

        assertThat(tracking.getStatus()).isEqualTo("OUT_FOR_DELIVERY");
    }

    @Test
    void podCompletionRequiresPhotoAndSignature() {
        PackageTracking tracking = assignedPackage("DRV-01", "OUT_FOR_DELIVERY");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));

        assertThatThrownBy(() -> trackingService.completeDelivery(
                tracking.getOrderNumber(),
                "DRV-01",
                null,
                imageFile("signature", "signature.png"),
                "",
                "Customer address"
        )).isInstanceOf(InvalidTrackingStatusException.class)
                .hasMessageContaining("photo is required");
    }

    @Test
    void podSubmissionByWrongDriverIsRejected() {
        PackageTracking tracking = assignedPackage("DRV-02", "OUT_FOR_DELIVERY");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));

        assertThatThrownBy(() -> trackingService.completeDelivery(
                tracking.getOrderNumber(),
                "DRV-01",
                imageFile("photo", "photo.png"),
                imageFile("signature", "signature.png"),
                "",
                "Customer address"
        )).isInstanceOf(DriverAccessDeniedException.class);
    }

    @Test
    void successfulPodSavesEvidenceAndChangesStatusToDelivered() {
        PackageTracking tracking = assignedPackage("DRV-01", "OUT_FOR_DELIVERY");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));
        when(deliveryProofRepository.existsByOrderNumber(tracking.getOrderNumber())).thenReturn(false);
        when(trackingHistoryRepository.findByOrderNumberOrderByEventTimeAsc(tracking.getOrderNumber())).thenReturn(List.of());

        var response = trackingService.completeDelivery(
                tracking.getOrderNumber(),
                "DRV-01",
                imageFile("photo", "photo.png"),
                imageFile("signature", "signature.png"),
                "Left with recipient",
                "Customer address"
        );

        assertThat(response.getStatus()).isEqualTo("DELIVERED");
        assertThat(tracking.getStatus()).isEqualTo("DELIVERED");
        ArgumentCaptor<DeliveryProof> proofCaptor = ArgumentCaptor.forClass(DeliveryProof.class);
        verify(deliveryProofRepository).save(proofCaptor.capture());
        assertThat(proofCaptor.getValue().getPhoto()).isNotEmpty();
        assertThat(proofCaptor.getValue().getSignature()).isNotEmpty();
    }

    @Test
    void podPersistenceFailureDoesNotChangePackageStatus() {
        PackageTracking tracking = assignedPackage("DRV-01", "OUT_FOR_DELIVERY");
        when(packageTrackingRepository.findByOrderNumber(tracking.getOrderNumber())).thenReturn(Optional.of(tracking));
        when(deliveryProofRepository.existsByOrderNumber(tracking.getOrderNumber())).thenReturn(false);
        doThrow(new RuntimeException("db down")).when(deliveryProofRepository).save(any(DeliveryProof.class));

        assertThatThrownBy(() -> trackingService.completeDelivery(
                tracking.getOrderNumber(),
                "DRV-01",
                imageFile("photo", "photo.png"),
                imageFile("signature", "signature.png"),
                "",
                "Customer address"
        )).isInstanceOf(RuntimeException.class)
                .hasMessageContaining("db down");

        assertThat(tracking.getStatus()).isEqualTo("OUT_FOR_DELIVERY");
        verify(packageTrackingRepository, never()).save(any(PackageTracking.class));
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

    private PackageTracking assignedPackage(String driverId, String status) {
        PackageTracking tracking = packageTracking(status, "Dock 2");
        tracking.setAssignedDriverId(driverId);
        tracking.setDriverName("Amal Perera");
        tracking.setRouteId("RT-123");
        tracking.setVehicleId("VEH-01");
        tracking.setVehiclePlate("TRK-982");
        tracking.setAssignmentTime(LocalDateTime.of(2026, 8, 18, 10, 0));
        return tracking;
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

    private DriverStatusUpdateRequest driverStatusRequest(String status, String location, String reason, String note) {
        DriverStatusUpdateRequest request = new DriverStatusUpdateRequest();
        request.setStatus(status);
        request.setLocation(location);
        request.setReason(reason);
        request.setNote(note);
        return request;
    }

    private MockMultipartFile imageFile(String name, String filename) {
        return new MockMultipartFile(name, filename, "image/png", new byte[] {1, 2, 3});
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
