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
public class RouteGeneratedEvent {
    private String orderNumber;
    private Long clientId;
    private String routeId;
    private String driverId;
    private String driverName;
    private String vehicleId;
    private String vehiclePlate;
    private Double distanceKm;
    private Integer durationMinutes;
    private String trafficLevel;
    private LocalDateTime generatedAt;
}