package com.swiftlogistics.notification_service.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /*
     * ============================================================
     * DELIVERY / TRACKING NOTIFICATION
     * ============================================================
     */

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

        broadcastToRecipient(
                saved
        );

        return saved;
    }

    /*
     * ============================================================
     * ORDER CREATED NOTIFICATION
     * ============================================================
     */

    public Notification createOrderCreatedNotification(
            String orderNumber,
            Long clientId,
            String description) {

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
                        .title("Order Created")
                        .message(
                                description != null
                                        ? "Your order "
                                                + orderNumber
                                                + " has been created. "
                                                + description
                                        : "Your order "
                                                + orderNumber
                                                + " has been created."
                        )
                        .notificationType("ORDER_CREATED")
                        .status("PENDING")
                        .read(false)
                        .createdAt(LocalDateTime.now())
                        .build();

        Notification saved =
                notificationRepository.save(notification);

        broadcastToRecipient(
                saved
        );

        return saved;
    }

    /*
     * ============================================================
     * GET NOTIFICATIONS
     * ============================================================
     */

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
                .findByRecipientTypeAndRecipientIdOrderByCreatedAtDesc(
                        "CLIENT",
                        clientId.toString()
                )
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<NotificationDto> getDriverNotifications(
            String driverId) {

        return notificationRepository
                .findByRecipientTypeAndRecipientIdOrderByCreatedAtDesc(
                        "DRIVER",
                        driverId
                )
                .stream()
                .map(this::toDto)
                .toList();
    }

    /*
     * ============================================================
     * MARK ONE AS READ
     * ============================================================
     */

    @Transactional
    public void markAsRead(Long notificationId) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Notification not found: "
                                                + notificationId
                                )
                        );

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    /*
     * ============================================================
     * MARK ALL AS READ
     * ============================================================
     */

    @Transactional
    public void markAllAsRead(
            String recipientType,
            String recipientId) {

        List<Notification> notifications =
                notificationRepository
                        .findByRecipientTypeAndRecipientIdOrderByCreatedAtDesc(
                                recipientType,
                                recipientId
                        );

        for (Notification notification : notifications) {

            notification.setRead(true);
        }

        notificationRepository.saveAll(
                notifications
        );
    }

    /*
     * ============================================================
     * DTO CONVERSION
     * ============================================================
     */

    private NotificationDto toDto(
            Notification notification) {

        return NotificationDto.builder()
                .id(notification.getId())
                .orderNumber(notification.getOrderNumber())
                .clientId(notification.getClientId())
                .recipientType(
                        notification.getRecipientType()
                )
                .recipientId(
                        notification.getRecipientId()
                )
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

    /*
     * ============================================================
     * USER-SPECIFIC WEBSOCKET
     * ============================================================
     */

    private void broadcastToRecipient(
            Notification notification) {

        try {

            String json =
                    objectMapper.writeValueAsString(
                            toDto(notification)
                    );

            webSocketService.sendToRecipient(
                    notification.getRecipientType(),
                    notification.getRecipientId(),
                    json
            );

        } catch (JsonProcessingException e) {

            System.err.println(
                    "Failed to convert notification to JSON: "
                            + e.getMessage()
            );
        }
    }
}