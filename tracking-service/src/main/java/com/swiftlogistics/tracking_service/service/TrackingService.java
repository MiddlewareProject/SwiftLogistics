package com.swiftlogistics.tracking_service.service;

import com.swiftlogistics.tracking_service.dto.PackageStoredEvent;
import com.swiftlogistics.tracking_service.model.PackageTracking;
import com.swiftlogistics.tracking_service.model.TrackingHistory;
import com.swiftlogistics.tracking_service.repository.PackageTrackingRepository;
import com.swiftlogistics.tracking_service.repository.TrackingHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingService {
    private static final String STORED_DESCRIPTION = "Package stored in warehouse";

    private final PackageTrackingRepository packageTrackingRepository;
    private final TrackingHistoryRepository trackingHistoryRepository;

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
