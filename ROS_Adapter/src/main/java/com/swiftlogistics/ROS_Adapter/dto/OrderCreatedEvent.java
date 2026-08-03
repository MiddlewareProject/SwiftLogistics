package com.swiftlogistics.ROS_Adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
