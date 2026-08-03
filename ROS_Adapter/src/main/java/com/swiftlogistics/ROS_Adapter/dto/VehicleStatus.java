package com.swiftlogistics.ROS_Adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleStatus {
    private String vehicleId;
    private String vehiclePlate;
    private String vehicleType;
    private String status; // IDLE, EN_ROUTE, MAINTENANCE
}
