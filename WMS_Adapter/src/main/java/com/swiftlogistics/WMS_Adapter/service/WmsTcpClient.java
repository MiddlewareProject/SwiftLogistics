package com.swiftlogistics.WMS_Adapter.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class WmsTcpClient {
    private final String host;
    private final int port;
    private final int connectTimeoutMs;
    private final int readTimeoutMs;
    private final WmsTcpStatusService wmsTcpStatusService;

    public WmsTcpClient(
            @Value("${wms.tcp.host}") String host,
            @Value("${wms.tcp.port}") int port,
            @Value("${wms.tcp.connect-timeout-ms}") int connectTimeoutMs,
            @Value("${wms.tcp.read-timeout-ms}") int readTimeoutMs,
            WmsTcpStatusService wmsTcpStatusService
    ) {
        this.host = host;
        this.port = port;
        this.connectTimeoutMs = connectTimeoutMs;
        this.readTimeoutMs = readTimeoutMs;
        this.wmsTcpStatusService = wmsTcpStatusService;
    }

    public String sendMessage(String message) {
        log.info("Connecting to WMS TCP endpoint {}:{}", host, port);

        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), connectTimeoutMs);
            socket.setSoTimeout(readTimeoutMs);

            try (
                    PrintWriter writer = new PrintWriter(socket.getOutputStream(), true, StandardCharsets.UTF_8);
                    BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8))
            ) {
                log.debug("Sending WMS TCP message: {}", message);
                writer.println(message);

                String response = reader.readLine();
                if (response == null) {
                    throw new IllegalStateException("No response received from WMS TCP endpoint");
                }

                log.info("Received WMS TCP response: {}", response);
                wmsTcpStatusService.recordSuccess();
                return response;
            }
        } catch (IOException | IllegalStateException exception) {
            String messageWithEndpoint = "Failed to communicate with WMS TCP endpoint "
                    + host + ":" + port + ": " + exception.getMessage();
            wmsTcpStatusService.recordFailure(messageWithEndpoint);
            throw new IllegalStateException(messageWithEndpoint, exception);
        }
    }

    // Opens and immediately closes a TCP connection to establish real ONLINE/OFFLINE status
    // right at startup, instead of leaving it as UNKNOWN until the first real order arrives.
    @EventListener(ApplicationReadyEvent.class)
    public void checkConnectivity() {
        log.info("Checking WMS TCP connectivity to {}:{}", host, port);

        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), connectTimeoutMs);
            wmsTcpStatusService.recordSuccess();
        } catch (IOException exception) {
            wmsTcpStatusService.recordFailure(
                    "Failed to connect to WMS TCP endpoint " + host + ":" + port + ": " + exception.getMessage());
        }
    }

    public String getHost() {
        return host;
    }

    public int getPort() {
        return port;
    }
}
