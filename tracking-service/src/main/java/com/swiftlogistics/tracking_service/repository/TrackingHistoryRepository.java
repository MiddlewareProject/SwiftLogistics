package com.swiftlogistics.tracking_service.repository;

import com.swiftlogistics.tracking_service.model.TrackingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrackingHistoryRepository extends JpaRepository<TrackingHistory, Long> {
    List<TrackingHistory> findByOrderNumberOrderByEventTimeAsc(String orderNumber);

    List<TrackingHistory> findTop10ByOrderByEventTimeDesc();
}
