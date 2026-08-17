package com.swiftlogistics.notification_service.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.swiftlogistics.notification_service.dto.DriverLoginRequest;
import com.swiftlogistics.notification_service.dto.DriverLoginResponse;
import com.swiftlogistics.notification_service.entity.Driver;
import com.swiftlogistics.notification_service.repository.DriverRepository;
import com.swiftlogistics.notification_service.service.DriverService;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverRepository driverRepository;
    private final DriverService driverService;

    public DriverController(
            DriverRepository driverRepository,
            DriverService driverService) {

        this.driverRepository = driverRepository;
        this.driverService = driverService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllDrivers() {

        List<Map<String, Object>> drivers =
                driverRepository.findAll()
                        .stream()
                        .map(driver -> Map.<String, Object>of(
                                "driverId", driver.getDriverId(),
                                "name", driver.getName(),
                                "active", driver.isActive()
                        ))
                        .toList();

        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Map<String, Object>>> getAvailableDrivers() {

        List<Map<String, Object>> drivers =
                driverRepository.findByActiveTrue()
                        .stream()
                        .map(driver -> Map.<String, Object>of(
                                "driverId", driver.getDriverId(),
                                "name", driver.getName(),
                                "active", driver.isActive()
                        ))
                        .toList();

        return ResponseEntity.ok(drivers);
    }

    @PostMapping("/login")
    public ResponseEntity<DriverLoginResponse> login(
            @RequestBody DriverLoginRequest request) {

        return ResponseEntity.ok(
                driverService.login(request)
        );
    }
}