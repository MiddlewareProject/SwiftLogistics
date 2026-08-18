package com.swiftlogistics.ROS_Adapter.controller;

import com.swiftlogistics.ROS_Adapter.dto.AddDriverRequest;
import com.swiftlogistics.ROS_Adapter.dto.AddVehicleRequest;
import com.swiftlogistics.ROS_Adapter.dto.DriverInfo;
import com.swiftlogistics.ROS_Adapter.dto.GroupedRouteDto;
import com.swiftlogistics.ROS_Adapter.dto.OrderCreatedEvent;
import com.swiftlogistics.ROS_Adapter.dto.RosDashboardSnapshot;
import com.swiftlogistics.ROS_Adapter.dto.RosEventLogEntry;
import com.swiftlogistics.ROS_Adapter.dto.RouteResult;
import com.swiftlogistics.ROS_Adapter.dto.VehicleStatus;
import com.swiftlogistics.ROS_Adapter.exception.RosIntegrationException;
import com.swiftlogistics.ROS_Adapter.service.RosIntegrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @GetMapping("/routes")
    public List<GroupedRouteDto> groupedRoutes() {
        return rosIntegrationService.getGroupedRoutes();
    }

    @GetMapping("/latest")
    public ResponseEntity<RouteResult> latest() {
        return ResponseEntity.of(rosIntegrationService.getLatestRoute());
    }

    @PostMapping("/drivers")
    public ResponseEntity<DriverInfo> addDriver(@Valid @RequestBody AddDriverRequest request) {
        DriverInfo driver = rosIntegrationService.addDriver(request.getDriverId(), request.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(driver);
    }

    @PostMapping("/vehicles")
    public ResponseEntity<VehicleStatus> addVehicle(@Valid @RequestBody AddVehicleRequest request) {
        VehicleStatus vehicle = rosIntegrationService.addVehicle(
                request.getVehicleId(), request.getVehiclePlate(), request.getVehicleType());
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicle);
    }

    // Manually re-runs route generation for an order whose route fell out of
    // in-memory history (e.g. after a container restart), without needing to
    // replay the original OrderCreated message through RabbitMQ.
    @PostMapping("/backfill")
    public ResponseEntity<RouteResult> backfill(@RequestBody OrderCreatedEvent event) {
        rosIntegrationService.onOrderCreated(event);
        return ResponseEntity.ok(rosIntegrationService.getRoute(event.getOrderNumber()));
    }

    @ExceptionHandler(RosIntegrationException.class)
    public ResponseEntity<String> handleRosIntegrationException(RosIntegrationException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(exception.getMessage());
    }
}
