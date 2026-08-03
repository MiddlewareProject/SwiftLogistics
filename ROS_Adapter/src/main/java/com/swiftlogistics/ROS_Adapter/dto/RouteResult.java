package com.swiftlogistics.ROS_Adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteResult {
    private String orderNumber;
    private Long clientId;
    private String routeId;
    private String driverId;
    private String driverName;
    private String vehicleId;
    private String vehiclePlate;
    private String vehicleType;
    private String pickupAddress;
    private String deliveryAddress;
    private Double distanceKm;
    private Integer durationMinutes;
    private String trafficLevel;
    private Long optimizationTimeMs;
    private LocalDateTime generatedAt;
}
