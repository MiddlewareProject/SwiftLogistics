package com.swiftlogistics.tracking_service.exception;

public class DriverAccessDeniedException extends RuntimeException {
    public DriverAccessDeniedException(String message) {
        super(message);
    }
}
