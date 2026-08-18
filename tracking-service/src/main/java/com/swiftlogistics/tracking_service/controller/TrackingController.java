package com.swiftlogistics.tracking_service.controller;

import com.swiftlogistics.tracking_service.dto.DeliveryProofResponse;
import com.swiftlogistics.tracking_service.dto.DriverStatusUpdateRequest;
import com.swiftlogistics.tracking_service.dto.StatusUpdateRequest;
import com.swiftlogistics.tracking_service.dto.TrackingResponse;
import com.swiftlogistics.tracking_service.dto.WarehouseDashboardResponse;
import com.swiftlogistics.tracking_service.exception.DriverAccessDeniedException;
import com.swiftlogistics.tracking_service.exception.InvalidTrackingStatusException;
import com.swiftlogistics.tracking_service.exception.TrackingNotFoundException;
import com.swiftlogistics.tracking_service.service.TrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TrackingController {
    private final TrackingService trackingService;

    @GetMapping("/dashboard")
    public ResponseEntity<WarehouseDashboardResponse> getWarehouseDashboard() {
        return ResponseEntity.ok(trackingService.getWarehouseDashboard());
    }

    @GetMapping("/driver")
    public ResponseEntity<?> getDriverDashboard(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Username", required = false) String username,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        ResponseEntity<String> rejection = rejectNonDriver(role, username);
        if (rejection != null) {
            return rejection;
        }

        try {
            return ResponseEntity.ok(
                    java.util.Map.of("packages", trackingService.getDriverPackages(username))
            );

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/driver/history")
    public ResponseEntity<?> getDriverHistory(
            @RequestHeader(value = "X-User-Username", required = false) String username,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        ResponseEntity<String> rejection = rejectNonDriver(role, username);
        if (rejection != null) {
            return rejection;
        }

        return ResponseEntity.ok(java.util.Map.of("packages", trackingService.getDriverHistory(username)));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<TrackingResponse> getTracking(@PathVariable String orderNumber) {
        return ResponseEntity.ok(trackingService.getTracking(orderNumber));
    }

    @PatchMapping("/{orderNumber}/status")
    public ResponseEntity<TrackingResponse> updateStatus(
            @PathVariable String orderNumber,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(trackingService.updateStatus(orderNumber, request));
    }

    @PatchMapping("/driver/{orderNumber}/status")
    public ResponseEntity<?> updateDriverStatus(
            @PathVariable String orderNumber,
            @RequestHeader(value = "X-User-Username", required = false) String username,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @Valid @RequestBody DriverStatusUpdateRequest request
    ) {
        ResponseEntity<String> rejection = rejectNonDriver(role, username);
        if (rejection != null) {
            return rejection;
        }

        return ResponseEntity.ok(trackingService.updateDriverStatus(orderNumber, username, request));
    }

    @PostMapping(value = "/driver/{orderNumber}/complete", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> completeDelivery(
            @PathVariable String orderNumber,
            @RequestHeader(value = "X-User-Username", required = false) String username,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestPart("photo") MultipartFile photo,
            @RequestPart("signature") MultipartFile signature,
            @RequestPart(value = "note", required = false) String note,
            @RequestPart(value = "location", required = false) String location
    ) {
        ResponseEntity<String> rejection = rejectNonDriver(role, username);
        if (rejection != null) {
            return rejection;
        }

        DeliveryProofResponse response = trackingService.completeDelivery(
                orderNumber,
                username,
                photo,
                signature,
                note,
                location
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private ResponseEntity<String> rejectNonDriver(String role, String username) {
        if (role == null || role.isBlank() || username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Unauthorized: Driver authentication is required");
        }

        if (!"DRIVER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Forbidden: Driver access required");
        }

        return null;
    }

    @ExceptionHandler(TrackingNotFoundException.class)
    public ResponseEntity<String> handleNotFound(TrackingNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exception.getMessage());
    }

    @ExceptionHandler({InvalidTrackingStatusException.class, MethodArgumentNotValidException.class})
    public ResponseEntity<String> handleBadRequest(Exception exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exception.getMessage());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleUploadTooLarge(MaxUploadSizeExceededException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Delivery proof upload is too large. Use images smaller than 5 MB each.");
    }

    @ExceptionHandler(DriverAccessDeniedException.class)
    public ResponseEntity<String> handleForbidden(DriverAccessDeniedException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(exception.getMessage());
    }
}
