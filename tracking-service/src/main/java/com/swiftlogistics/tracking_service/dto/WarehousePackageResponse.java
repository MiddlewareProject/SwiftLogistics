package com.swiftlogistics.tracking_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehousePackageResponse {
    private String orderNumber;
    private Long clientId;
    private String packageId;
    private String status;
    private String currentLocation;
    private LocalDateTime updatedAt;
}
