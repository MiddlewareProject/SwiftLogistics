package com.swiftlogistics.tracking_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackingResponse {
    private String orderNumber;
    private Long clientId;
    private String packageId;
    private String status;
    private String currentLocation;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TrackingHistoryResponse> history;
}
