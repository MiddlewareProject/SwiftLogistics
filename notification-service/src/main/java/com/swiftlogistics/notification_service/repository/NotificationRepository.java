package com.swiftlogistics.notification_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.swiftlogistics.notification_service.entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findByRecipientTypeAndRecipientIdOrderByCreatedAtDesc(
            String recipientType,
            String recipientId
    );

    List<Notification> findByClientIdOrderByCreatedAtDesc(
            Long clientId
    );

    List<Notification> findByRecipientTypeAndRecipientIdAndReadFalseOrderByCreatedAtDesc(
            String recipientType,
            String recipientId
    );
}