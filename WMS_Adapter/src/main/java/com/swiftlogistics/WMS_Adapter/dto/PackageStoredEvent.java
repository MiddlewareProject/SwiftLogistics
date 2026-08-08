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
public class PackageStoredEvent {
    private String orderNumber;
    private Long clientId;
    private String packageId;
    private String status;
    private String warehouseLocation;
    private LocalDateTime storedAt;
}
