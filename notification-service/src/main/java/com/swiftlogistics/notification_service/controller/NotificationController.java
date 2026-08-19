package com.swiftlogistics.notification_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.swiftlogistics.notification_service.dto.NotificationDto;
import com.swiftlogistics.notification_service.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getAllNotifications() {

        return ResponseEntity.ok(
                notificationService.getAllNotifications()
        );
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<NotificationDto>> getClientNotifications(
            @PathVariable Long clientId) {

        return ResponseEntity.ok(
                notificationService.getClientNotifications(clientId)
        );
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<NotificationDto>> getDriverNotifications(
            @PathVariable String driverId) {

        return ResponseEntity.ok(
                notificationService.getDriverNotifications(driverId)
        );
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(
            @PathVariable Long notificationId) {

        notificationService.markAsRead(notificationId);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllNotificationsAsRead(
            @RequestParam String recipientType,
            @RequestParam String recipientId) {

        notificationService.markAllAsRead(
                recipientType,
                recipientId
        );

        return ResponseEntity.ok().build();
    }
}