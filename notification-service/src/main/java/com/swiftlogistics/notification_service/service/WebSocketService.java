package com.swiftlogistics.notification_service.service;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class WebSocketService extends TextWebSocketHandler {

    /*
     * Stores active WebSocket sessions by recipient.
     *
     * Examples:
     *
     * CLIENT:15
     * DRIVER:DRV001
     *
     * This ensures that a notification is sent only
     * to the relevant client or driver.
     */
    private final Map<String, WebSocketSession> sessions =
            new ConcurrentHashMap<>();


    /*
     * ------------------------------------------------------------
     * CONNECTION ESTABLISHED
     * ------------------------------------------------------------
     */
    @Override
    public void afterConnectionEstablished(
            WebSocketSession session) {

        String recipientType =
                getQueryParameter(session, "type");

        String recipientId =
                getQueryParameter(session, "id");

        if (recipientType == null
                || recipientType.isBlank()
                || recipientId == null
                || recipientId.isBlank()) {

            System.out.println(
                    "WebSocket rejected: missing type or id"
            );

            try {

                session.close(
                        CloseStatus.BAD_DATA
                );

            } catch (IOException e) {

                e.printStackTrace();
            }

            return;
        }

        recipientType =
                recipientType.toUpperCase();

        String key =
                recipientType + ":" + recipientId;

        /*
         * If the same user opens another tab,
         * replace the previous session with the
         * newest active session.
         */
        WebSocketSession previousSession =
                sessions.put(key, session);

        if (previousSession != null
                && previousSession.isOpen()
                && !previousSession.getId()
                        .equals(session.getId())) {

            try {

                previousSession.close(
                        CloseStatus.NORMAL
                );

            } catch (IOException e) {

                e.printStackTrace();
            }
        }

        System.out.println(
                "WebSocket client connected: "
                        + key
                        + " | session="
                        + session.getId()
        );
    }


    /*
     * ------------------------------------------------------------
     * CONNECTION CLOSED
     * ------------------------------------------------------------
     */
    @Override
    public void afterConnectionClosed(
            WebSocketSession session,
            CloseStatus status) {

        sessions.entrySet().removeIf(
                entry ->
                        entry.getValue()
                                .getId()
                                .equals(session.getId())
        );

        System.out.println(
                "WebSocket client disconnected: "
                        + session.getId()
                        + " | status="
                        + status
        );
    }


    /*
     * ------------------------------------------------------------
     * SEND TO SPECIFIC RECIPIENT
     * ------------------------------------------------------------
     */
    public void sendToRecipient(
            String recipientType,
            String recipientId,
            String message) {

        if (recipientType == null
                || recipientType.isBlank()
                || recipientId == null
                || recipientId.isBlank()
                || message == null) {

            return;
        }

        String key =
                recipientType.toUpperCase()
                        + ":"
                        + recipientId;

        WebSocketSession session =
                sessions.get(key);

        /*
         * User is not currently connected.
         *
         * This is NOT an error because the notification
         * has already been persisted in PostgreSQL.
         *
         * When the user refreshes/logs in again,
         * App.jsx loads the persisted notification.
         */
        if (session == null) {

            System.out.println(
                    "No active WebSocket session for "
                            + key
                            + ". Notification remains persisted."
            );

            return;
        }

        if (!session.isOpen()) {

            sessions.remove(key);

            return;
        }

        try {

            session.sendMessage(
                    new TextMessage(message)
            );

            System.out.println(
                    "Notification sent via WebSocket to "
                            + key
            );

        } catch (IOException e) {

            System.err.println(
                    "Failed to send WebSocket message to "
                            + key
                            + ": "
                            + e.getMessage()
            );

            sessions.remove(key);
        }
    }


    /*
     * ------------------------------------------------------------
     * CONNECTED SESSION COUNT
     * ------------------------------------------------------------
     */
    public int getConnectedClients() {

        return sessions.size();
    }


    /*
     * ------------------------------------------------------------
     * QUERY PARAMETER
     * ------------------------------------------------------------
     *
     * Example:
     *
     * ws://localhost:8086/ws/notifications
     *     ?type=CLIENT&id=15
     *
     */
    private String getQueryParameter(
            WebSocketSession session,
            String parameter) {

        if (session.getUri() == null
                || session.getUri().getQuery() == null) {

            return null;
        }

        String query =
                session.getUri().getQuery();

        for (String parameterPair :
                query.split("&")) {

            String[] parts =
                    parameterPair.split("=", 2);

            if (parts.length == 2
                    && parts[0].equals(parameter)) {

                return URLDecoder.decode(
                        parts[1],
                        StandardCharsets.UTF_8
                );
            }
        }

        return null;
    }
}