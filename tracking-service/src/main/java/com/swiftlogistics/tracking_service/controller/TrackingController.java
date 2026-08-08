package com.swiftlogistics.tracking_service.controller;

import com.swiftlogistics.tracking_service.dto.StatusUpdateRequest;
import com.swiftlogistics.tracking_service.dto.TrackingResponse;
import com.swiftlogistics.tracking_service.exception.InvalidTrackingStatusException;
import com.swiftlogistics.tracking_service.exception.TrackingNotFoundException;
import com.swiftlogistics.tracking_service.service.TrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TrackingController {
    private final TrackingService trackingService;

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
