package com.swiftlogistics.tracking_service.controller;

import com.swiftlogistics.tracking_service.dto.StatusUpdateRequest;
import com.swiftlogistics.tracking_service.dto.TrackingResponse;
import com.swiftlogistics.tracking_service.dto.WarehouseDashboardResponse;
import com.swiftlogistics.tracking_service.exception.InvalidTrackingStatusException;
import com.swiftlogistics.tracking_service.exception.TrackingNotFoundException;
import com.swiftlogistics.tracking_service.service.TrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        if (!"DRIVER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Forbidden: Driver access required");
        }

        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Unauthorized: Driver identity is missing");
        }

        try {
            List<com.swiftlogistics.tracking_service.dto.WarehousePackageResponse> packages =
                    trackingService.getDriverPackages(username);

            return ResponseEntity.ok(
                    java.util.Map.of("packages", packages)
            );

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
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

    @ExceptionHandler(TrackingNotFoundException.class)
    public ResponseEntity<String> handleNotFound(TrackingNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exception.getMessage());
    }

    @ExceptionHandler({InvalidTrackingStatusException.class, MethodArgumentNotValidException.class})
    public ResponseEntity<String> handleBadRequest(Exception exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exception.getMessage());
    }
}
