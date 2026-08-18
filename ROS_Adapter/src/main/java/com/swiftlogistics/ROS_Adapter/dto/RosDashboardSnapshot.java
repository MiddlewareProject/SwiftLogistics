package com.swiftlogistics.ROS_Adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RosDashboardSnapshot {
    private boolean connected;
    private long routesGenerated;
    private int vehicleCount;
    private int driverCount;
    private long avgOptimizationTimeMs;
    private List<RosEventLogEntry> recentEvents;
    private List<RouteResult> recentRoutes;
    private List<VehicleStatus> vehicleStatus;
    private List<DriverInfo> drivers;
    private List<GroupedRouteDto> groupedRoutes;
}
