package com.swiftlogistics.notification_service.service;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class WebSocketService extends TextWebSocketHandler {

    private final Set<WebSocketSession> sessions =
            new CopyOnWriteArraySet<>();

    @Override
    public void afterConnectionEstablished(
            WebSocketSession session) {

        sessions.add(session);

        System.out.println(
                "WebSocket client connected: "
                        + session.getId()
        );
    }

    @Override
    public void afterConnectionClosed(
            WebSocketSession session,
            CloseStatus status) {

        sessions.remove(session);

        System.out.println(
                "WebSocket client disconnected: "
                        + session.getId()
        );
    }

    public void broadcast(String message) {

        TextMessage textMessage =
                new TextMessage(message);

        for (WebSocketSession session : sessions) {

            if (session.isOpen()) {

                try {
                    session.sendMessage(textMessage);

                } catch (IOException e) {

                    System.err.println(
                            "Failed to send WebSocket message: "
                                    + e.getMessage()
                    );
                }
            }
        }
    }

    public int getConnectedClients() {
        return sessions.size();
    }
}