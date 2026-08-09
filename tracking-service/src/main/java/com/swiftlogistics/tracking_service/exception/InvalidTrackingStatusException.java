package com.swiftlogistics.tracking_service.exception;

public class InvalidTrackingStatusException extends RuntimeException {

    public InvalidTrackingStatusException(String message) {
        super(message);
    }
}
