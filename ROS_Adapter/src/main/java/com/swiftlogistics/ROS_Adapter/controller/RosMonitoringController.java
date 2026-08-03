package com.swiftlogistics.ROS_Adapter.controller;

import com.swiftlogistics.ROS_Adapter.dto.RosDashboardSnapshot;
import com.swiftlogistics.ROS_Adapter.dto.RosEventLogEntry;
import com.swiftlogistics.ROS_Adapter.dto.RouteResult;
import com.swiftlogistics.ROS_Adapter.service.RosIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ros")
@RequiredArgsConstructor
public class RosMonitoringController {
    private final RosIntegrationService rosIntegrationService;

    @GetMapping("/dashboard")
    public RosDashboardSnapshot dashboard() {
        return rosIntegrationService.getDashboardSnapshot();
    }

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok(rosIntegrationService.getDashboardSnapshot().isConnected() ? "Connected" : "Disconnected");
    }

    @GetMapping("/events")
    public List<RosEventLogEntry> events() {
        return rosIntegrationService.getRecentEvents();
    }

    @GetMapping("/routes/{orderNumber}")
    public RouteResult route(@PathVariable String orderNumber) {
        return rosIntegrationService.getRoute(orderNumber);
    }

    @GetMapping("/latest")
    public ResponseEntity<RouteResult> latest() {
        return ResponseEntity.of(rosIntegrationService.getLatestRoute());
    }
}
