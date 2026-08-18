package com.swiftlogistics.ROS_Adapter.dto;

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
public class GroupedRouteDto {
    private String routeId;
    private String driverId;
    private String driverName;
    private String vehicleId;
    private String vehiclePlate;
    private String vehicleType;
    private String hubAddress;
    private String region;
    private double totalDistanceKm;
    private int totalDurationMinutes;
    private String trafficLevel;
    private boolean active;
    private LocalDateTime createdAt;
    private List<RouteStopDto> stops;
}
