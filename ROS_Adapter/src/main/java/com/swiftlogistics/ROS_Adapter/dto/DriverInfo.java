package com.swiftlogistics.ROS_Adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverInfo {
    private String driverId;
    private String name;
    private String status; // AVAILABLE, ON_ROUTE
}
