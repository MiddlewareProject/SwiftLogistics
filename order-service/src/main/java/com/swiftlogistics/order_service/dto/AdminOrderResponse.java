package com.swiftlogistics.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminOrderResponse {
    private Long id;
    private String orderNumber;
    private String clientUsername;
    private String description;
    private String senderAddress;
    private String recipientAddress;
    private Double weight;
    private String status;
    private LocalDateTime createdAt;
}
