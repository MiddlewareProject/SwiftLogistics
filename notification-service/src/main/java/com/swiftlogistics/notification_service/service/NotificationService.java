package com.swiftlogistics.notification_service.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.swiftlogistics.notification_service.dto.NotificationDto;
import com.swiftlogistics.notification_service.entity.Notification;
import com.swiftlogistics.notification_service.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final WebSocketService webSocketService;
    private final ObjectMapper objectMapper;

    public NotificationService(
            NotificationRepository notificationRepository,
            WebSocketService webSocketService,
            ObjectMapper objectMapper) {

        this.notificationRepository = notificationRepository;
        this.webSocketService = webSocketService;
        this.objectMapper = objectMapper;
    }

    public Notification createAndBroadcast(
            String orderNumber,
            Long clientId,
            String packageId,
            String status,
            String location,
            String description) {

        String title;
        String message;
        String notificationType;

        if ("DELIVERED".equalsIgnoreCase(status)) {

            title = "Delivery Completed";
            message =
                    "Package " + packageId
                            + " for order " + orderNumber
                            + " has been delivered.";

            notificationType = "DELIVERY_COMPLETED";

        } else if ("FAILED".equalsIgnoreCase(status)) {

            title = "Delivery Failed";
            message =
                    "Delivery for order " + orderNumber
                            + " could not be completed.";

            notificationType = "DELIVERY_FAILED";

        } else {

            title = "Delivery Update";
            message =
                    description != null
                            ? description
                            : "Order " + orderNumber
                                    + " status changed to "
                                    + status;

            notificationType = "DELIVERY_UPDATE";
        }

        Notification notification =
                Notification.builder()
                        .orderNumber(orderNumber)
                        .clientId(clientId)
                        .recipientType("CLIENT")
                        .recipientId(
                                clientId != null
                                        ? clientId.toString()
                                        : null
                        )
                        .title(title)
                        .message(message)
                        .notificationType(notificationType)
                        .status(status)
                        .read(false)
                        .createdAt(LocalDateTime.now())
                        .build();

        Notification saved =
                notificationRepository.save(notification);

        NotificationDto dto =
                toDto(saved);

        broadcast(dto);

        return saved;
    }

    public List<NotificationDto> getAllNotifications() {

        return notificationRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<NotificationDto> getClientNotifications(
            Long clientId) {

        return notificationRepository
                .findByClientIdOrderByCreatedAtDesc(clientId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private NotificationDto toDto(
            Notification notification) {

        return NotificationDto.builder()
                .id(notification.getId())
                .orderNumber(notification.getOrderNumber())
                .clientId(notification.getClientId())
                .recipientType(notification.getRecipientType())
                .recipientId(notification.getRecipientId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .notificationType(
                        notification.getNotificationType()
                )
                .status(notification.getStatus())
                .createdAt(notification.getCreatedAt())
                .read(notification.isRead())
                .build();
    }

    private void broadcast(
            NotificationDto notification) {

        try {

            String json =
                    objectMapper.writeValueAsString(
                            notification
                    );

            webSocketService.broadcast(json);

        } catch (JsonProcessingException e) {

            System.err.println(
                    "Failed to convert notification to JSON: "
                            + e.getMessage()
            );
        }
    }
}