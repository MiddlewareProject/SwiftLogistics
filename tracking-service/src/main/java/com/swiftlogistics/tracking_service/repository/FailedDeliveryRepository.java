package com.swiftlogistics.tracking_service.repository;

import com.swiftlogistics.tracking_service.model.FailedDelivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FailedDeliveryRepository extends JpaRepository<FailedDelivery, Long> {
}
