package com.swiftlogistics.tracking_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "pending_driver_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingDriverAssignment {
    @Id
    private String orderNumber;

    private Long clientId;

    @Column(nullable = false)
    private String driverId;

    private String routeId;
    private String driverName;
    private String vehicleId;
    private String vehiclePlate;
    private Integer stopSequence;
    private Double distanceKm;
    private Integer durationMinutes;
    private String trafficLevel;

    @Column(nullable = false)
    private LocalDateTime generatedAt;

    @Column(nullable = false)
    private LocalDateTime receivedAt;
}
