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
@Table(name = "tracking_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackingHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String orderNumber;

    @Column(nullable = false)
    private String packageId;

    @Column(nullable = false)
    private String status;

    private String location;

    private String description;

    @Column(nullable = false)
    private LocalDateTime eventTime;
}
