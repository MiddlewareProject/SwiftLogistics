package com.swiftlogistics.tracking_service.repository;

import com.swiftlogistics.tracking_service.model.PackageTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PackageTrackingRepository extends JpaRepository<PackageTracking, Long> {
    Optional<PackageTracking> findByOrderNumber(String orderNumber);

    long countByStatus(String status);

    List<PackageTracking> findAllByOrderByUpdatedAtDesc();
}
