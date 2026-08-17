package com.swiftlogistics.tracking_service.service;

import com.swiftlogistics.tracking_service.dto.PackageStoredEvent;
import com.swiftlogistics.tracking_service.dto.StatusUpdateRequest;
import com.swiftlogistics.tracking_service.dto.TrackingHistoryResponse;
import com.swiftlogistics.tracking_service.dto.TrackingResponse;
import com.swiftlogistics.tracking_service.dto.TrackingUpdatedEvent;
import com.swiftlogistics.tracking_service.dto.WarehouseActivityResponse;
import com.swiftlogistics.tracking_service.dto.WarehouseCapacityResponse;
import com.swiftlogistics.tracking_service.dto.WarehouseDashboardResponse;
import com.swiftlogistics.tracking_service.dto.WarehouseDashboardStats;
import com.swiftlogistics.tracking_service.dto.WarehousePackageResponse;
import com.swiftlogistics.tracking_service.exception.InvalidTrackingStatusException;
import com.swiftlogistics.tracking_service.exception.TrackingNotFoundException;
import com.swiftlogistics.tracking_service.model.PackageTracking;
import com.swiftlogistics.tracking_service.model.TrackingHistory;
import com.swiftlogistics.tracking_service.model.TrackingStatus;
import com.swiftlogistics.tracking_service.repository.PackageTrackingRepository;
import com.swiftlogistics.tracking_service.repository.TrackingHistoryRepository;
import com.swiftlogistics.tracking_service.dto.RouteGeneratedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingService {
    private static final String STORED_DESCRIPTION = "Package stored in warehouse";

    private final PackageTrackingRepository packageTrackingRepository;
    private final TrackingHistoryRepository trackingHistoryRepository;
    private final TrackingUpdatedPublisher trackingUpdatedPublisher;

    @Value("${warehouse.capacity}")
    private long warehouseCapacity;

    @Transactional
    public void handlePackageStored(PackageStoredEvent event) {
        validateEvent(event);

        LocalDateTime eventTime = event.getStoredAt() != null ? event.getStoredAt() : LocalDateTime.now();
        packageTrackingRepository.findByOrderNumber(event.getOrderNumber())
                .ifPresentOrElse(
                        existing -> handleExistingTracking(existing, event),
                        () -> createTracking(event, eventTime)
                );
    }

    public TrackingResponse getTracking(String orderNumber) {
        PackageTracking tracking = findTracking(orderNumber);
        return toTrackingResponse(tracking);
    }

    @Transactional(readOnly = true)
    public WarehouseDashboardResponse getWarehouseDashboard() {
        long stored = packageTrackingRepository.countByStatus(TrackingStatus.WAREHOUSE.name());
        long totalCapacity = Math.max(warehouseCapacity, 0);

        WarehouseDashboardStats stats = WarehouseDashboardStats.builder()
                .received(packageTrackingRepository.count())
                .stored(stored)
                .loaded(packageTrackingRepository.countByStatus(TrackingStatus.LOADED.name()))
                .outForDelivery(packageTrackingRepository.countByStatus(TrackingStatus.OUT_FOR_DELIVERY.name()))
                .delivered(packageTrackingRepository.countByStatus(TrackingStatus.DELIVERED.name()))
                .failed(packageTrackingRepository.countByStatus(TrackingStatus.FAILED.name()))
                .build();

        WarehouseCapacityResponse capacity = WarehouseCapacityResponse.builder()
                .used(stored)
                .total(totalCapacity)
                .percentage(totalCapacity > 0 ? (stored * 100.0) / totalCapacity : 0.0)
                .build();

        List<WarehousePackageResponse> packages = packageTrackingRepository.findAllByOrderByUpdatedAtDesc()
                .stream()
                .map(this::toWarehousePackageResponse)
                .toList();

        List<WarehouseActivityResponse> recentActivity = trackingHistoryRepository.findTop10ByOrderByEventTimeDesc()
                .stream()
                .map(this::toWarehouseActivityResponse)
                .toList();

        return WarehouseDashboardResponse.builder()
                .stats(stats)
                .capacity(capacity)
                .packages(packages)
                .recentActivity(recentActivity)
                .build();
    }

    @Transactional
    public TrackingResponse updateStatus(String orderNumber, StatusUpdateRequest request) {
        validateStatusRequest(request);

        PackageTracking tracking = findTracking(orderNumber);
        TrackingStatus currentStatus = parseStatus(tracking.getStatus());
        TrackingStatus requestedStatus = parseStatus(request.getStatus());

        if (currentStatus == requestedStatus) {
            log.info("Duplicate tracking status update ignored for order {} status {}", orderNumber, requestedStatus);
            return toTrackingResponse(tracking);
        }

        validateTransition(currentStatus, requestedStatus);

        LocalDateTime now = LocalDateTime.now();
        String location = isBlank(request.getLocation()) ? tracking.getCurrentLocation() : request.getLocation();
        String description = isBlank(request.getDescription())
                ? defaultDescription(requestedStatus)
                : request.getDescription();

        tracking.setStatus(requestedStatus.name());
        tracking.setCurrentLocation(location);
        tracking.setUpdatedAt(now);
        packageTrackingRepository.save(tracking);

        TrackingHistory history = TrackingHistory.builder()
                .orderNumber(tracking.getOrderNumber())
                .packageId(tracking.getPackageId())
                .status(requestedStatus.name())
                .location(location)
                .description(description)
                .eventTime(now)
                .build();
        trackingHistoryRepository.save(history);

        TrackingUpdatedEvent event = TrackingUpdatedEvent.builder()
                .orderNumber(tracking.getOrderNumber())
                .clientId(tracking.getClientId())
                .packageId(tracking.getPackageId())
                .status(tracking.getStatus())
                .location(tracking.getCurrentLocation())
                .description(description)
                .updatedAt(now)
                .build();
        trackingUpdatedPublisher.publish(event);

        return toTrackingResponse(tracking);
    }

    @Transactional
    public void assignDriver(RouteGeneratedEvent event) {
        if (event == null || isBlank(event.getOrderNumber())) {
            throw new IllegalArgumentException("RouteGeneratedEvent orderNumber is required");
        }

        if (isBlank(event.getDriverId())) {
            throw new IllegalArgumentException("RouteGeneratedEvent driverId is required");
        }

        PackageTracking tracking = packageTrackingRepository.findByOrderNumber(event.getOrderNumber())
                .orElseThrow(() -> new IllegalStateException(
                        "No tracking record found for route assignment: " + event.getOrderNumber()
                ));

        tracking.setAssignedDriverId(event.getDriverId());
        packageTrackingRepository.save(tracking);

        log.info(
                "Driver {} assigned to order {}",
                event.getDriverId(),
                event.getOrderNumber()
        );
    }

    @Transactional(readOnly = true)
    public List<WarehousePackageResponse> getDriverPackages(String driverId) {
        if (isBlank(driverId)) {
            throw new IllegalArgumentException("Driver ID is required");
        }

        return packageTrackingRepository
                .findByAssignedDriverIdOrderByUpdatedAtDesc(driverId)
                .stream()
                .map(this::toWarehousePackageResponse)
                .toList();
    }

    private void createTracking(PackageStoredEvent event, LocalDateTime eventTime) {
        PackageTracking tracking = PackageTracking.builder()
                .orderNumber(event.getOrderNumber())
                .clientId(event.getClientId())
                .packageId(event.getPackageId())
                .status(event.getStatus())
                .currentLocation(event.getWarehouseLocation())
                .createdAt(eventTime)
                .updatedAt(eventTime)
                .build();

        packageTrackingRepository.save(tracking);

        TrackingHistory history = TrackingHistory.builder()
                .orderNumber(event.getOrderNumber())
                .packageId(event.getPackageId())
                .status(event.getStatus())
                .location(event.getWarehouseLocation())
                .description(STORED_DESCRIPTION)
                .eventTime(eventTime)
                .build();

        trackingHistoryRepository.save(history);
        log.info("PackageStored persisted for order {} package {}", event.getOrderNumber(), event.getPackageId());
    }

    private void handleExistingTracking(PackageTracking existing, PackageStoredEvent event) {
        if (isDuplicate(existing, event)) {
            log.info("Duplicate PackageStored ignored for order {} package {}", event.getOrderNumber(), event.getPackageId());
            return;
        }

        if (!Objects.equals(existing.getPackageId(), event.getPackageId())) {
            throw new IllegalStateException("Conflicting PackageStored event for order " + event.getOrderNumber()
                    + ": existing packageId " + existing.getPackageId()
                    + " but received " + event.getPackageId());
        }

        throw new IllegalStateException("Conflicting PackageStored state for order " + event.getOrderNumber());
    }

    private boolean isDuplicate(PackageTracking existing, PackageStoredEvent event) {
        return Objects.equals(existing.getPackageId(), event.getPackageId())
                && Objects.equals(existing.getStatus(), event.getStatus())
                && Objects.equals(existing.getCurrentLocation(), event.getWarehouseLocation());
    }

    private PackageTracking findTracking(String orderNumber) {
        if (isBlank(orderNumber)) {
            throw new TrackingNotFoundException("Tracking orderNumber is required");
        }

        return packageTrackingRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new TrackingNotFoundException("No tracking record found for order " + orderNumber));
    }

    private TrackingResponse toTrackingResponse(PackageTracking tracking) {
        List<TrackingHistoryResponse> history = trackingHistoryRepository
                .findByOrderNumberOrderByEventTimeAsc(tracking.getOrderNumber())
                .stream()
                .map(this::toHistoryResponse)
                .toList();

        return TrackingResponse.builder()
                .orderNumber(tracking.getOrderNumber())
                .clientId(tracking.getClientId())
                .packageId(tracking.getPackageId())
                .status(tracking.getStatus())
                .currentLocation(tracking.getCurrentLocation())
                .createdAt(tracking.getCreatedAt())
                .updatedAt(tracking.getUpdatedAt())
                .history(history)
                .build();
    }

    private TrackingHistoryResponse toHistoryResponse(TrackingHistory history) {
        return TrackingHistoryResponse.builder()
                .status(history.getStatus())
                .location(history.getLocation())
                .description(history.getDescription())
                .eventTime(history.getEventTime())
                .build();
    }

    private WarehousePackageResponse toWarehousePackageResponse(PackageTracking tracking) {
        return WarehousePackageResponse.builder()
                .orderNumber(tracking.getOrderNumber())
                .clientId(tracking.getClientId())
                .packageId(tracking.getPackageId())
                .status(tracking.getStatus())
                .currentLocation(tracking.getCurrentLocation())
                .updatedAt(tracking.getUpdatedAt())
                .build();
    }

    private WarehouseActivityResponse toWarehouseActivityResponse(TrackingHistory history) {
        return WarehouseActivityResponse.builder()
                .orderNumber(history.getOrderNumber())
                .packageId(history.getPackageId())
                .status(history.getStatus())
                .location(history.getLocation())
                .description(history.getDescription())
                .eventTime(history.getEventTime())
                .build();
    }

    private TrackingStatus parseStatus(String status) {
        if (isBlank(status)) {
            throw new InvalidTrackingStatusException("Tracking status is required");
        }

        try {
            return TrackingStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new InvalidTrackingStatusException("Unknown tracking status: " + status);
        }
    }

    private void validateTransition(TrackingStatus currentStatus, TrackingStatus requestedStatus) {
        boolean valid = switch (currentStatus) {
            case PENDING -> requestedStatus == TrackingStatus.WAREHOUSE;
            case WAREHOUSE -> requestedStatus == TrackingStatus.LOADED;
            case LOADED -> requestedStatus == TrackingStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY -> requestedStatus == TrackingStatus.DELIVERED
                    || requestedStatus == TrackingStatus.FAILED;
            case DELIVERED, FAILED -> false;
        };

        if (!valid) {
            throw new InvalidTrackingStatusException("Invalid tracking status transition: "
                    + currentStatus + " -> " + requestedStatus);
        }
    }

    private String defaultDescription(TrackingStatus status) {
        return switch (status) {
            case WAREHOUSE -> STORED_DESCRIPTION;
            case LOADED -> "Package loaded onto delivery vehicle";
            case OUT_FOR_DELIVERY -> "Package is out for delivery";
            case DELIVERED -> "Package delivered successfully";
            case FAILED -> "Delivery attempt failed";
            case PENDING -> "Package tracking created";
        };
    }

    private void validateStatusRequest(StatusUpdateRequest request) {
        if (request == null || isBlank(request.getStatus())) {
            throw new InvalidTrackingStatusException("Status is required");
        }
    }

    private void validateEvent(PackageStoredEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("PackageStoredEvent is required");
        }
        if (isBlank(event.getOrderNumber())) {
            throw new IllegalArgumentException("PackageStoredEvent orderNumber is required");
        }
        if (event.getClientId() == null) {
            throw new IllegalArgumentException("PackageStoredEvent clientId is required");
        }
        if (isBlank(event.getPackageId())) {
            throw new IllegalArgumentException("PackageStoredEvent packageId is required");
        }
        if (isBlank(event.getStatus())) {
            throw new IllegalArgumentException("PackageStoredEvent status is required");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
