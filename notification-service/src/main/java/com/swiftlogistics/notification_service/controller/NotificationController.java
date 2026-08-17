package com.swiftlogistics.notification_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}