package com.swiftlogistics.tracking_service.repository;

import com.swiftlogistics.tracking_service.model.PackageTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("""
            select p from PackageTracking p
            where p.assignedDriverId is not null
              and lower(p.assignedDriverId) = lower(:driverId)
              and (
                p.status in :activeStatuses
                or (
                  p.status in :terminalStatuses
                  and p.updatedAt >= :terminalStart
                  and p.updatedAt < :terminalEnd
                )
              )
            order by p.assignmentTime asc, p.updatedAt asc
            """)
    List<PackageTracking> findDriverManifest(
            @Param("driverId") String driverId,
            @Param("activeStatuses") Collection<String> activeStatuses,
            @Param("terminalStatuses") Collection<String> terminalStatuses,
            @Param("terminalStart") LocalDateTime terminalStart,
            @Param("terminalEnd") LocalDateTime terminalEnd
    );

    List<PackageTracking> findTop50ByAssignedDriverIdIgnoreCaseAndStatusInOrderByUpdatedAtDesc(
            String assignedDriverId,
            Collection<String> statuses
    );

    @Query("""
            select p from PackageTracking p
            where (p.assignedDriverId is null or trim(p.assignedDriverId) = '')
              and p.status in :statuses
            """)
    List<PackageTracking> findActiveUnassignedPackages(@Param("statuses") Collection<String> statuses);

}
