package com.swiftlogistics.tracking_service.repository;

import com.swiftlogistics.tracking_service.model.PackageTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface PackageTrackingRepository extends JpaRepository<PackageTracking, Long> {
    Optional<PackageTracking> findByOrderNumber(String orderNumber);

    long countByStatus(String status);

    List<PackageTracking> findAllByOrderByUpdatedAtDesc();

    List<PackageTracking> findByAssignedDriverIdOrderByUpdatedAtDesc(String assignedDriverId);

    List<PackageTracking> findByAssignedDriverIdAndStatusInAndAssignmentTimeBetweenOrderByAssignmentTimeAsc(
            String assignedDriverId,
            Collection<String> statuses,
            LocalDateTime start,
            LocalDateTime end
    );

    List<PackageTracking> findTop50ByAssignedDriverIdAndStatusInOrderByUpdatedAtDesc(
            String assignedDriverId,
            Collection<String> statuses
    );

}
