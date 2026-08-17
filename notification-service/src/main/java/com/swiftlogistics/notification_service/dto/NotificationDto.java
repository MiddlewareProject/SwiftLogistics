package com.swiftlogistics.notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {

    private Long id;

    private String orderNumber;

    private Long clientId;

    private String recipientType;

    private String recipientId;

    private String title;

    private String message;

    private String notificationType;

    private String status;

    private LocalDateTime createdAt;

    private boolean read;
}