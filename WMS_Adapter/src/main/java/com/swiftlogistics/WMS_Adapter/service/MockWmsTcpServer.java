package com.swiftlogistics.WMS_Adapter.service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@Slf4j
public class MockWmsTcpServer {
    private static final String WAREHOUSE_STATUS = "WAREHOUSE";
    private static final String WAREHOUSE_LOCATION = "A-12";

    private final int port;
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();
    private volatile boolean running;
    private ServerSocket serverSocket;

    public MockWmsTcpServer(@Value("${mock.wms.tcp.port}") int port) {
        this.port = port;
    }

    @PostConstruct
    public void start() {
        running = true;
        executorService.submit(this::listen);
    }

    @PreDestroy
    public void stop() {
        running = false;
        closeServerSocket();
        executorService.shutdownNow();
        log.info("Mock WMS TCP server stopped");
    }

    String processMessage(String message) {
        if (message == null || message.isBlank()) {
            return "ERR|INVALID_MESSAGE";
        }

        String[] fields = message.split("\\|", -1);
        if (fields.length != 7) {
            return "ERR|INVALID_MESSAGE";
        }

        if (!"STORE".equals(fields[0])) {
            return "ERR|UNSUPPORTED_COMMAND";
        }

        String orderNumber = fields[1];
        if (orderNumber == null || orderNumber.isBlank()) {
            return "ERR|INVALID_MESSAGE";
        }

        return String.join("|",
                "ACK",
                orderNumber,
                generatePackageId(),
                WAREHOUSE_STATUS,
                WAREHOUSE_LOCATION
        );
    }

    private void listen() {
        try (ServerSocket socket = new ServerSocket(port)) {
            serverSocket = socket;
            log.info("Mock WMS TCP server listening on port {}", port);

            while (running) {
                try {
                    handleClient(socket.accept());
                } catch (SocketException exception) {
                    if (running) {
                        log.error("Mock WMS TCP server socket error: {}", exception.getMessage());
                    }
                } catch (IOException exception) {
                    log.error("Mock WMS TCP server failed to handle client: {}", exception.getMessage());
                }
            }
        } catch (IOException exception) {
            if (running) {
                log.error("Mock WMS TCP server failed to start on port {}: {}", port, exception.getMessage());
            }
        }
    }

    private void handleClient(Socket clientSocket) throws IOException {
        try (
                Socket socket = clientSocket;
                BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
                PrintWriter writer = new PrintWriter(socket.getOutputStream(), true, StandardCharsets.UTF_8)
        ) {
            String message = reader.readLine();
            log.info("Mock WMS received TCP message: {}", message);

            String response = processMessage(message);
            writer.println(response);
            log.info("Mock WMS sent TCP response: {}", response);
        }
    }

    private String generatePackageId() {
        return "PKG-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private void closeServerSocket() {
        if (serverSocket == null) {
            return;
        }

        try {
            serverSocket.close();
        } catch (IOException exception) {
            log.warn("Failed to close Mock WMS TCP server socket: {}", exception.getMessage());
        }
    }
}
