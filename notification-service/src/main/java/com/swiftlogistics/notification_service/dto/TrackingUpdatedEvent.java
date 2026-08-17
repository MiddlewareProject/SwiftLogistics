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
public class TrackingUpdatedEvent {

    private String orderNumber;

    private Long clientId;

    private String packageId;

    private String status;

    private String location;

    private String description;

    private LocalDateTime updatedAt;
}