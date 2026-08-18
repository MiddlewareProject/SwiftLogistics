package com.swiftlogistics.tracking_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "failed_deliveries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FailedDelivery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String orderNumber;

    @Column(nullable = false)
    private String driverId;

    @Column(nullable = false)
    private String reason;

    private String note;

    private String location;

    @Column(nullable = false)
    private LocalDateTime failedAt;
}
