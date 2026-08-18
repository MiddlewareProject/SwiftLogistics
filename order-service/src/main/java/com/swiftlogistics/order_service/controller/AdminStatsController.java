package com.swiftlogistics.order_service.controller;

import com.swiftlogistics.order_service.dto.AdminOrderResponse;
import com.swiftlogistics.order_service.dto.AdminStatsResponse;
import com.swiftlogistics.order_service.dto.AdminUserResponse;
import com.swiftlogistics.order_service.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders/admin")
@RequiredArgsConstructor
public class AdminStatsController {
    private final AdminStatsService adminStatsService;

    @GetMapping("/stats")
    public AdminStatsResponse stats() {
        return adminStatsService.getStats();
    }

    @GetMapping("/users")
    public List<AdminUserResponse> users() {
        return adminStatsService.getUsers();
    }

    @GetMapping("/orders")
    public List<AdminOrderResponse> orders() {
        return adminStatsService.getOrders();
    }
}
