package com.swiftlogistics.tracking_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseDashboardResponse {
    private WarehouseDashboardStats stats;
    private WarehouseCapacityResponse capacity;
    private List<WarehousePackageResponse> packages;
    private List<WarehouseActivityResponse> recentActivity;
}
