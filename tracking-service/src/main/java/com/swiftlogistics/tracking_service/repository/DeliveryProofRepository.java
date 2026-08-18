package com.swiftlogistics.tracking_service.repository;

import com.swiftlogistics.tracking_service.model.DeliveryProof;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeliveryProofRepository extends JpaRepository<DeliveryProof, Long> {
    boolean existsByOrderNumber(String orderNumber);
}
