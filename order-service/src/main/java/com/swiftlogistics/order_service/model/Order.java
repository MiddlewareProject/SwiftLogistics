package com.swiftlogistics.order_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String orderNumber;

    @Column(nullable = false)
    private Long clientId;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String senderAddress;

    @Column(nullable = false)
    private String recipientAddress;

    @Column(nullable = false)
    private Double weight;

    private String receiverName;

    private String receiverPhone;

    private String packageType;

    private String priority;

    @Column(columnDefinition = "TEXT")
    private String deliveryNotes;

    @Column(nullable = false)
    private String status; // PENDING, IN_TRANSIT, DELIVERED, etc.

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
