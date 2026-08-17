package com.swiftlogistics.notification_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.swiftlogistics.notification_service.entity.Driver;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    Optional<Driver> findByDriverId(String driverId);

    boolean existsByDriverId(String driverId);
}