package com.swiftlogistics.tracking_service.repository;

import com.swiftlogistics.tracking_service.model.PendingDriverAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PendingDriverAssignmentRepository extends JpaRepository<PendingDriverAssignment, String> {
}
