package com.swiftlogistics.tracking_service.service;

import com.swiftlogistics.tracking_service.dto.PackageStoredEvent;
import com.swiftlogistics.tracking_service.dto.StatusUpdateRequest;
import com.swiftlogistics.tracking_service.dto.TrackingHistoryResponse;
import com.swiftlogistics.tracking_service.dto.TrackingResponse;
import com.swiftlogistics.tracking_service.dto.TrackingUpdatedEvent;
import com.swiftlogistics.tracking_service.exception.InvalidTrackingStatusException;
import com.swiftlogistics.tracking_service.exception.TrackingNotFoundException;
import com.swiftlogistics.tracking_service.model.PackageTracking;
import com.swiftlogistics.tracking_service.model.TrackingHistory;
import com.swiftlogistics.tracking_service.model.TrackingStatus;
import com.swiftlogistics.tracking_service.repository.PackageTrackingRepository;
import com.swiftlogistics.tracking_service.repository.TrackingHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
