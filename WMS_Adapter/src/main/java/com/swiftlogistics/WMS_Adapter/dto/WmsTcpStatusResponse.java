package com.swiftlogistics.WMS_Adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WmsTcpStatusResponse {
    private String status;
    private String host;
    private int port;
    private LocalDateTime lastSuccessfulAt;
    private LocalDateTime lastFailureAt;
    private String lastError;
}
