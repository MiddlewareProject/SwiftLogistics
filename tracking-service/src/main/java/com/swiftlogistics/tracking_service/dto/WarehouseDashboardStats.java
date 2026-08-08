package com.swiftlogistics.tracking_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseDashboardStats {
    private long received;
    private long stored;
    private long loaded;
    private long outForDelivery;
    private long delivered;
    private long failed;
}
