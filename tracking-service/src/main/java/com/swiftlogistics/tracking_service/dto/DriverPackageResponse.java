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
public class DriverPackageResponse {
    private String orderNumber;
    private Long clientId;
    private String packageId;
    private String status;
    private String currentLocation;
    private LocalDateTime updatedAt;
    private String routeId;
    private String driverId;
    private String driverName;
    private String vehicleId;
    private String vehiclePlate;
    private Integer stopSequence;
    private Double distanceKm;
    private Integer durationMinutes;
    private String trafficLevel;
    private LocalDateTime assignmentTime;
}
