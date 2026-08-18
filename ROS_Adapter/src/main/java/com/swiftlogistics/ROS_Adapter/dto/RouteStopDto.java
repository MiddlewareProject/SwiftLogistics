package com.swiftlogistics.ROS_Adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteStopDto {
    private int sequence;
    private String orderNumber;
    private String receiverName;
    private String deliveryAddress;
    private double cumulativeDistanceKm;
    private int cumulativeDurationMinutes;
}
