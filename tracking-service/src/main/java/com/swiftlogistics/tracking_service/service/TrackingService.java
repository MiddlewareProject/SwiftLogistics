package com.swiftlogistics.tracking_service.service;

import com.swiftlogistics.tracking_service.dto.PackageStoredEvent;
import com.swiftlogistics.tracking_service.dto.DeliveryProofResponse;
import com.swiftlogistics.tracking_service.dto.DriverPackageResponse;
import com.swiftlogistics.tracking_service.dto.DriverStatusUpdateRequest;
import com.swiftlogistics.tracking_service.dto.StatusUpdateRequest;
import com.swiftlogistics.tracking_service.dto.TrackingHistoryResponse;
import com.swiftlogistics.tracking_service.dto.TrackingResponse;
import com.swiftlogistics.tracking_service.dto.TrackingUpdatedEvent;
import com.swiftlogistics.tracking_service.dto.WarehouseActivityResponse;
import com.swiftlogistics.tracking_service.dto.WarehouseCapacityResponse;
import com.swiftlogistics.tracking_service.dto.WarehouseDashboardResponse;
import com.swiftlogistics.tracking_service.dto.WarehouseDashboardStats;
import com.swiftlogistics.tracking_service.dto.WarehousePackageResponse;
import com.swiftlogistics.tracking_service.exception.DriverAccessDeniedException;
import com.swiftlogistics.tracking_service.exception.InvalidTrackingStatusException;
import com.swiftlogistics.tracking_service.exception.TrackingNotFoundException;
import com.swiftlogistics.tracking_service.model.DeliveryProof;
import com.swiftlogistics.tracking_service.model.FailedDelivery;
import com.swiftlogistics.tracking_service.model.PackageTracking;
import com.swiftlogistics.tracking_service.model.PendingDriverAssignment;
import com.swiftlogistics.tracking_service.model.TrackingHistory;
import com.swiftlogistics.tracking_service.model.TrackingStatus;
import com.swiftlogistics.tracking_service.repository.DeliveryProofRepository;
import com.swiftlogistics.tracking_service.repository.FailedDeliveryRepository;
import com.swiftlogistics.tracking_service.repository.PackageTrackingRepository;
import com.swiftlogistics.tracking_service.repository.PendingDriverAssignmentRepository;
import com.swiftlogistics.tracking_service.repository.TrackingHistoryRepository;
import com.swiftlogistics.tracking_service.dto.RouteGeneratedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingService {
    private static final String STORED_DESCRIPTION = "Package stored in warehouse";
    private static final long MAX_PROOF_FILE_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_PROOF_MEDIA_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );
    private static final List<String> DRIVER_ACTIVE_MANIFEST_STATUSES = List.of(
            TrackingStatus.LOADED.name(),
            TrackingStatus.OUT_FOR_DELIVERY.name()
    );
    private static final List<String> DRIVER_HISTORY_STATUSES = List.of(
            TrackingStatus.DELIVERED.name(),
            TrackingStatus.FAILED.name()
    );
    private static final List<String> ACTIVE_UNASSIGNED_RECOVERY_STATUSES = List.of(
            TrackingStatus.WAREHOUSE.name(),
            TrackingStatus.LOADED.name(),
            TrackingStatus.OUT_FOR_DELIVERY.name()
    );

    private final PackageTrackingRepository packageTrackingRepository;
    private final TrackingHistoryRepository trackingHistoryRepository;
    private final DeliveryProofRepository deliveryProofRepository;
    private final FailedDeliveryRepository failedDeliveryRepository;
    private final PendingDriverAssignmentRepository pendingDriverAssignmentRepository;
    private final TrackingUpdatedPublisher trackingUpdatedPublisher;
    private final RosRouteLookupClient rosRouteLookupClient;
    private final Clock clock;

    @Value("${warehouse.capacity}")
    private long warehouseCapacity;

    @Value("${app.timezone:Asia/Colombo}")
    private String appTimezone;

    @Value("${app.source-event-timezone:UTC}")
    private String sourceEventTimezone;

    @Transactional
    public void handlePackageStored(PackageStoredEvent event) {
        validateEvent(event);

        LocalDateTime eventTime = event.getStoredAt() != null ? event.getStoredAt() : now();
        packageTrackingRepository.findByOrderNumber(event.getOrderNumber())
                .ifPresentOrElse(
                        existing -> handleExistingTracking(existing, event),
                        () -> createTracking(event, eventTime)
                );
        packageTrackingRepository.findByOrderNumber(event.getOrderNumber())
                .ifPresent(this::applyPendingAssignmentIfPresent);
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

        LocalDateTime now = now();
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
    public boolean assignDriver(RouteGeneratedEvent event) {
        if (event == null || isBlank(event.getOrderNumber())) {
            throw new IllegalArgumentException("RouteGeneratedEvent orderNumber is required");
        }

        if (isBlank(event.getDriverId())) {
            throw new IllegalArgumentException("RouteGeneratedEvent driverId is required");
        }

        PackageTracking tracking = packageTrackingRepository
                .findByOrderNumber(event.getOrderNumber())
                .orElse(null);

        if (tracking == null) {
            log.warn(
                    "Tracking record not yet available for route assignment; saving pending assignment: orderNumber={}, driverId={}",
                    event.getOrderNumber(),
                    event.getDriverId()
            );
            savePendingAssignment(event);
            return true;
        }

        LocalDateTime assignmentTime = normalizeAssignmentTime(event.getGeneratedAt());
        applyAssignmentFields(tracking, event, assignmentTime);

        TrackingUpdatedEvent notificationEvent = TrackingUpdatedEvent.builder()
                .orderNumber(tracking.getOrderNumber())
                .clientId(tracking.getClientId())
                .packageId(tracking.getPackageId())
                .status(tracking.getStatus())
                .location(tracking.getCurrentLocation())
                .description(
                        "Driver " + event.getDriverName()
                                + " assigned to order " + tracking.getOrderNumber()
                )
                .updatedAt(tracking.getUpdatedAt())
                .build();

        trackingUpdatedPublisher.publish(notificationEvent);

        log.info(
                "Driver {} assigned to order {}",
                event.getDriverId(),
                event.getOrderNumber()
        );

        return true;
    }

    @Transactional
    public List<DriverPackageResponse> getDriverPackages(String driverId) {
        if (isBlank(driverId)) {
            throw new IllegalArgumentException("Driver ID is required");
        }

        recoverMissingAssignments();

        LocalDate today = LocalDate.now(clock);
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        return packageTrackingRepository
                .findDriverManifest(
                        driverId,
                        DRIVER_ACTIVE_MANIFEST_STATUSES,
                        DRIVER_HISTORY_STATUSES,
                        start,
                        end
                )
                .stream()
                .map(this::toDriverPackageResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DriverPackageResponse> getDriverHistory(String driverId) {
        if (isBlank(driverId)) {
            throw new IllegalArgumentException("Driver ID is required");
        }

        return packageTrackingRepository
                .findTop50ByAssignedDriverIdIgnoreCaseAndStatusInOrderByUpdatedAtDesc(driverId, DRIVER_HISTORY_STATUSES)
                .stream()
                .map(this::toDriverPackageResponse)
                .toList();
    }

    @Transactional
    public TrackingResponse updateDriverStatus(String orderNumber, String driverId, DriverStatusUpdateRequest request) {
        validateDriverId(driverId);
        validateDriverStatusRequest(request);

        PackageTracking tracking = findTracking(orderNumber);
        verifyAssignedDriver(tracking, driverId);

        TrackingStatus currentStatus = parseStatus(tracking.getStatus());
        TrackingStatus requestedStatus = parseStatus(request.getStatus());

        if (requestedStatus == TrackingStatus.DELIVERED) {
            if (currentStatus != TrackingStatus.OUT_FOR_DELIVERY) {
                throw new InvalidTrackingStatusException("Invalid driver tracking status transition: "
                        + currentStatus + " -> " + requestedStatus);
            }
            if (!deliveryProofRepository.existsByOrderNumber(tracking.getOrderNumber())) {
                throw new InvalidTrackingStatusException("Proof of Delivery is required before marking delivered");
            }
            return applyStatusUpdate(tracking, requestedStatus, request.getLocation(), "Package delivered successfully");
        }

        if (currentStatus == TrackingStatus.LOADED && requestedStatus == TrackingStatus.OUT_FOR_DELIVERY) {
            return applyStatusUpdate(tracking, requestedStatus, request.getLocation(), "Driver started delivery");
        }

        if (currentStatus == TrackingStatus.OUT_FOR_DELIVERY && requestedStatus == TrackingStatus.FAILED) {
            if (isBlank(request.getReason())) {
                throw new InvalidTrackingStatusException("Failure reason is required");
            }
            LocalDateTime now = now();
            failedDeliveryRepository.save(FailedDelivery.builder()
                    .orderNumber(tracking.getOrderNumber())
                    .driverId(driverId)
                    .reason(request.getReason().trim())
                    .note(trimToNull(request.getNote()))
                    .location(trimToNull(request.getLocation()))
                    .failedAt(now)
                    .build());
            String description = isBlank(request.getNote())
                    ? "Delivery failed: " + request.getReason().trim()
                    : "Delivery failed: " + request.getReason().trim() + " - " + request.getNote().trim();
            return applyStatusUpdate(tracking, requestedStatus, request.getLocation(), description, now);
        }

        throw new InvalidTrackingStatusException("Invalid driver tracking status transition: "
                + currentStatus + " -> " + requestedStatus);
    }

    @Transactional
    public DeliveryProofResponse completeDelivery(
            String orderNumber,
            String driverId,
            MultipartFile photo,
            MultipartFile signature,
            String note,
            String location
    ) {
        validateDriverId(driverId);
        validateProofFile(photo, "photo");
        validateProofFile(signature, "signature");

        PackageTracking tracking = findTracking(orderNumber);
        verifyAssignedDriver(tracking, driverId);

        TrackingStatus currentStatus = parseStatus(tracking.getStatus());
        if (currentStatus != TrackingStatus.OUT_FOR_DELIVERY) {
            throw new InvalidTrackingStatusException("Proof of Delivery requires OUT_FOR_DELIVERY status");
        }

        if (deliveryProofRepository.existsByOrderNumber(tracking.getOrderNumber())) {
            throw new InvalidTrackingStatusException("Delivery proof already exists for order " + tracking.getOrderNumber());
        }

        LocalDateTime now = now();
        DeliveryProof proof = DeliveryProof.builder()
                .orderNumber(tracking.getOrderNumber())
                .driverId(driverId)
                .photo(readFileBytes(photo, "photo"))
                .photoMediaType(photo.getContentType())
                .signature(readFileBytes(signature, "signature"))
                .signatureMediaType(signature.getContentType())
                .note(trimToNull(note))
                .location(trimToNull(location))
                .submittedAt(now)
                .build();
        deliveryProofRepository.save(proof);

        String description = isBlank(note)
                ? "Package delivered successfully with proof of delivery"
                : "Package delivered successfully with proof of delivery - " + note.trim();
        applyStatusUpdate(tracking, TrackingStatus.DELIVERED, location, description, now);

        return DeliveryProofResponse.builder()
                .orderNumber(tracking.getOrderNumber())
                .driverId(driverId)
                .status(tracking.getStatus())
                .submittedAt(now)
                .build();
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

        TrackingUpdatedEvent notificationEvent = TrackingUpdatedEvent.builder()
            .orderNumber(tracking.getOrderNumber())
            .clientId(tracking.getClientId())
            .packageId(tracking.getPackageId())
            .status(tracking.getStatus())
            .location(tracking.getCurrentLocation())
            .description(STORED_DESCRIPTION)
            .updatedAt(eventTime)
            .build();

        trackingUpdatedPublisher.publish(notificationEvent);
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

    private void applyAssignmentFields(PackageTracking tracking, RouteGeneratedEvent event, LocalDateTime assignmentTime) {
        tracking.setAssignedDriverId(event.getDriverId());
        tracking.setRouteId(event.getRouteId());
        tracking.setDriverName(event.getDriverName());
        tracking.setVehicleId(event.getVehicleId());
        tracking.setVehiclePlate(event.getVehiclePlate());
        tracking.setStopSequence(event.getStopSequence());
        tracking.setDistanceKm(event.getDistanceKm());
        tracking.setDurationMinutes(event.getDurationMinutes());
        tracking.setTrafficLevel(event.getTrafficLevel());
        tracking.setAssignmentTime(assignmentTime);
        tracking.setUpdatedAt(assignmentTime);
        packageTrackingRepository.save(tracking);
    }

    private void savePendingAssignment(RouteGeneratedEvent event) {
        pendingDriverAssignmentRepository.save(PendingDriverAssignment.builder()
                .orderNumber(event.getOrderNumber())
                .clientId(event.getClientId())
                .driverId(event.getDriverId())
                .routeId(event.getRouteId())
                .driverName(event.getDriverName())
                .vehicleId(event.getVehicleId())
                .vehiclePlate(event.getVehiclePlate())
                .stopSequence(event.getStopSequence())
                .distanceKm(event.getDistanceKm())
                .durationMinutes(event.getDurationMinutes())
                .trafficLevel(event.getTrafficLevel())
                .generatedAt(normalizeAssignmentTime(event.getGeneratedAt()))
                .receivedAt(now())
                .build());
    }

    private void applyPendingAssignmentIfPresent(PackageTracking tracking) {
        pendingDriverAssignmentRepository.findById(tracking.getOrderNumber())
                .ifPresent(pending -> {
                    RouteGeneratedEvent event = RouteGeneratedEvent.builder()
                            .orderNumber(pending.getOrderNumber())
                            .clientId(pending.getClientId())
                            .driverId(pending.getDriverId())
                            .driverName(pending.getDriverName())
                            .routeId(pending.getRouteId())
                            .vehicleId(pending.getVehicleId())
                            .vehiclePlate(pending.getVehiclePlate())
                            .stopSequence(pending.getStopSequence())
                            .distanceKm(pending.getDistanceKm())
                            .durationMinutes(pending.getDurationMinutes())
                            .trafficLevel(pending.getTrafficLevel())
                            .generatedAt(pending.getGeneratedAt())
                            .build();
                    applyAssignmentFields(tracking, event, pending.getGeneratedAt());
                    pendingDriverAssignmentRepository.delete(pending);
                    log.info("Applied pending driver assignment for order {}", tracking.getOrderNumber());
                });
    }

    private void recoverMissingAssignments() {
        packageTrackingRepository.findActiveUnassignedPackages(ACTIVE_UNASSIGNED_RECOVERY_STATUSES)
                .forEach(tracking -> rosRouteLookupClient.findRoute(tracking.getOrderNumber())
                        .ifPresent(route -> recoverAssignment(tracking, route)));
    }

    private void recoverAssignment(PackageTracking tracking, RouteGeneratedEvent route) {
        if (tracking == null || route == null || !isBlank(tracking.getAssignedDriverId())) {
            return;
        }

        if (isBlank(route.getDriverId())) {
            log.warn("ROS route for order {} did not include a driverId; leaving Tracking unassigned", tracking.getOrderNumber());
            return;
        }

        RouteGeneratedEvent assignment = RouteGeneratedEvent.builder()
                .orderNumber(tracking.getOrderNumber())
                .clientId(route.getClientId())
                .routeId(route.getRouteId())
                .driverId(route.getDriverId())
                .driverName(route.getDriverName())
                .vehicleId(route.getVehicleId())
                .vehiclePlate(route.getVehiclePlate())
                .stopSequence(route.getStopSequence())
                .distanceKm(route.getDistanceKm())
                .durationMinutes(route.getDurationMinutes())
                .trafficLevel(route.getTrafficLevel())
                .generatedAt(route.getGeneratedAt())
                .build();

        applyAssignmentFields(
                tracking,
                assignment,
                route.getGeneratedAt() == null ? now() : normalizeAssignmentTime(route.getGeneratedAt())
        );
        log.info("Recovered missing Tracking driver assignment for order {} from ROS route {}", tracking.getOrderNumber(), route.getRouteId());
    }

    private LocalDateTime normalizeAssignmentTime(LocalDateTime generatedAt) {
        if (generatedAt == null) {
            return now();
        }

        ZoneId sourceZone = ZoneId.of(sourceEventTimezone);
        ZoneId applicationZone = clock.getZone();
        return generatedAt.atZone(sourceZone)
                .withZoneSameInstant(applicationZone)
                .toLocalDateTime();
    }

    private LocalDateTime now() {
        return LocalDateTime.now(clock);
    }

    private DriverPackageResponse toDriverPackageResponse(PackageTracking tracking) {
        return DriverPackageResponse.builder()
                .orderNumber(tracking.getOrderNumber())
                .clientId(tracking.getClientId())
                .packageId(tracking.getPackageId())
                .status(tracking.getStatus())
                .currentLocation(tracking.getCurrentLocation())
                .updatedAt(tracking.getUpdatedAt())
                .routeId(tracking.getRouteId())
                .driverId(tracking.getAssignedDriverId())
                .driverName(tracking.getDriverName())
                .vehicleId(tracking.getVehicleId())
                .vehiclePlate(tracking.getVehiclePlate())
                .stopSequence(tracking.getStopSequence())
                .distanceKm(tracking.getDistanceKm())
                .durationMinutes(tracking.getDurationMinutes())
                .trafficLevel(tracking.getTrafficLevel())
                .assignmentTime(tracking.getAssignmentTime())
                .build();
    }

    private TrackingResponse applyStatusUpdate(
            PackageTracking tracking,
            TrackingStatus requestedStatus,
            String requestedLocation,
            String description
    ) {
        return applyStatusUpdate(tracking, requestedStatus, requestedLocation, description, now());
    }

    private TrackingResponse applyStatusUpdate(
            PackageTracking tracking,
            TrackingStatus requestedStatus,
            String requestedLocation,
            String description,
            LocalDateTime eventTime
    ) {
        String location = isBlank(requestedLocation) ? tracking.getCurrentLocation() : requestedLocation;

        tracking.setStatus(requestedStatus.name());
        tracking.setCurrentLocation(location);
        tracking.setUpdatedAt(eventTime);
        packageTrackingRepository.save(tracking);

        TrackingHistory history = TrackingHistory.builder()
                .orderNumber(tracking.getOrderNumber())
                .packageId(tracking.getPackageId())
                .status(requestedStatus.name())
                .location(location)
                .description(description)
                .eventTime(eventTime)
                .build();
        trackingHistoryRepository.save(history);

        TrackingUpdatedEvent event = TrackingUpdatedEvent.builder()
                .orderNumber(tracking.getOrderNumber())
                .clientId(tracking.getClientId())
                .packageId(tracking.getPackageId())
                .status(tracking.getStatus())
                .location(tracking.getCurrentLocation())
                .description(description)
                .updatedAt(eventTime)
                .build();
        trackingUpdatedPublisher.publish(event);

        return toTrackingResponse(tracking);
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

    private void validateDriverStatusRequest(DriverStatusUpdateRequest request) {
        if (request == null || isBlank(request.getStatus())) {
            throw new InvalidTrackingStatusException("Status is required");
        }
    }

    private void validateDriverId(String driverId) {
        if (isBlank(driverId)) {
            throw new DriverAccessDeniedException("Driver identity is required");
        }
    }

    private void verifyAssignedDriver(PackageTracking tracking, String driverId) {
        if (isBlank(tracking.getAssignedDriverId()) || !tracking.getAssignedDriverId().equalsIgnoreCase(driverId)) {
            throw new DriverAccessDeniedException("Forbidden: Package is assigned to another driver");
        }
    }

    private void validateProofFile(MultipartFile file, String fieldName) {
        if (file == null || file.isEmpty()) {
            throw new InvalidTrackingStatusException("Delivery proof " + fieldName + " is required");
        }

        if (file.getSize() > MAX_PROOF_FILE_BYTES) {
            throw new InvalidTrackingStatusException("Delivery proof " + fieldName + " exceeds 5 MB");
        }

        String mediaType = file.getContentType();
        if (isBlank(mediaType) || !ALLOWED_PROOF_MEDIA_TYPES.contains(mediaType.toLowerCase())) {
            throw new InvalidTrackingStatusException("Delivery proof " + fieldName + " must be an image");
        }
    }

    private byte[] readFileBytes(MultipartFile file, String fieldName) {
        try {
            return file.getBytes();
        } catch (IOException exception) {
            throw new InvalidTrackingStatusException("Unable to read delivery proof " + fieldName);
        }
    }

    private String trimToNull(String value) {
        return isBlank(value) ? null : value.trim();
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
