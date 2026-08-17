package com.swiftlogistics.notification_service.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreatedEvent {

    private String orderNumber;
    private Long clientId;
    private String description;
    private String senderAddress;
    private String recipientAddress;
    private Double weight;
    private String status;
    private LocalDateTime createdAt;
}