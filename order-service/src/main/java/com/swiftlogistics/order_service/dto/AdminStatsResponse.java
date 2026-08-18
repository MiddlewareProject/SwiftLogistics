package com.swiftlogistics.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long totalOrders;
    private long totalDrivers;
    private List<DailyOrderCount> dailyOrders;
}
