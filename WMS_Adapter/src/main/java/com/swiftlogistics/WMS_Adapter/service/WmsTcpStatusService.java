package com.swiftlogistics.WMS_Adapter.service;

import com.swiftlogistics.WMS_Adapter.dto.WmsTcpStatusResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class WmsTcpStatusService {
    private String status = "UNKNOWN";
    private LocalDateTime lastSuccessfulAt;
    private LocalDateTime lastFailureAt;
    private String lastError;

    public synchronized void recordSuccess() {
        status = "ONLINE";
        lastSuccessfulAt = LocalDateTime.now();
        lastError = null;
    }

    public synchronized void recordFailure(String errorMessage) {
        status = "OFFLINE";
        lastFailureAt = LocalDateTime.now();
        lastError = errorMessage;
    }

    public synchronized WmsTcpStatusResponse getStatus(String host, int port) {
        return WmsTcpStatusResponse.builder()
                .status(status)
                .host(host)
                .port(port)
                .lastSuccessfulAt(lastSuccessfulAt)
                .lastFailureAt(lastFailureAt)
                .lastError(lastError)
                .build();
    }
}
