package com.swiftlogistics.tracking_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseCapacityResponse {
    private long used;
    private long total;
    private double percentage;
}
