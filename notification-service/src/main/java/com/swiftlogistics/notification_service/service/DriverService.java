package com.swiftlogistics.notification_service.service;

import org.springframework.stereotype.Service;

import com.swiftlogistics.notification_service.dto.DriverLoginRequest;
import com.swiftlogistics.notification_service.dto.DriverLoginResponse;
import com.swiftlogistics.notification_service.entity.Driver;
import com.swiftlogistics.notification_service.repository.DriverRepository;
import com.swiftlogistics.notification_service.security.JwtUtil;

@Service
public class DriverService {

    private final DriverRepository driverRepository;
    private final JwtUtil jwtUtil;

    public DriverService(
            DriverRepository driverRepository,
            JwtUtil jwtUtil) {

        this.driverRepository = driverRepository;
        this.jwtUtil = jwtUtil;
    }

    public DriverLoginResponse login(
            DriverLoginRequest request) {

        Driver driver = driverRepository
                .findByDriverId(request.getDriverId())
                .orElseThrow(
                        () -> new RuntimeException(
                                "Invalid driver ID or password"
                        )
                );

        if (!driver.isActive()) {
            throw new RuntimeException(
                    "Driver account is inactive"
            );
        }

        if (!driver.getPassword()
                .equals(request.getPassword())) {

            throw new RuntimeException(
                    "Invalid driver ID or password"
            );
        }

        String token =
                jwtUtil.generateToken(
                        driver.getDriverId()
                );

        return DriverLoginResponse.builder()
                .token(token)
                .driverId(driver.getDriverId())
                .name(driver.getName())
                .message("Login successful")
                .build();
    }
}