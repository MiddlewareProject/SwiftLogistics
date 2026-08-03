package com.swiftlogistics.CMS_Adapter.service;

import com.swiftlogistics.CMS_Adapter.config.RabbitMqConfig;
import com.swiftlogistics.CMS_Adapter.dto.CmsCompletedEvent;
import com.swiftlogistics.CMS_Adapter.dto.CmsDashboardSnapshot;
import com.swiftlogistics.CMS_Adapter.dto.CmsEventLogEntry;
import com.swiftlogistics.CMS_Adapter.dto.CmsProcessingResult;
import com.swiftlogistics.CMS_Adapter.dto.CmsRetryEntry;
import com.swiftlogistics.CMS_Adapter.dto.CmsSoapResponse;
import com.swiftlogistics.CMS_Adapter.dto.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class CmsIntegrationService {
    private static final int MAX_RETRIES = 3;
    private static final int MAX_EVENTS = 20;

    private final CmsSoapTransformer transformer;
    private final MockCmsService mockCmsService;
    private final RabbitTemplate rabbitTemplate;

    private final AtomicLong totalSoapRequests = new AtomicLong();
    private final AtomicLong successfulRequests = new AtomicLong();
    private final AtomicLong failedRequests = new AtomicLong();
    private final Map<String, CmsProcessingResult> latestResults = new ConcurrentHashMap<>();
    private final Map<String, CmsRetryEntry> retryQueue = new ConcurrentHashMap<>();
    private final Deque<CmsEventLogEntry> eventLog = new ConcurrentLinkedDeque<>();

    @RabbitListener(queues = RabbitMqConfig.ORDER_CREATED_QUEUE)
    public void onOrderCreated(OrderCreatedEvent event) {
        processOrder(event);
    }

    public CmsProcessingResult retryOrder(String orderNumber) {
        CmsRetryEntry retryEntry = retryQueue.get(orderNumber);
        if (retryEntry == null) {
            throw new IllegalArgumentException("No retry entry found for order " + orderNumber);
        }

        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderNumber(retryEntry.getOrderNumber())
                .clientId(retryEntry.getClientId())
                .description("Manual retry from CMS dashboard")
                .senderAddress("Retry queue sender")
                .recipientAddress("Retry queue recipient")
                .weight(0D)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return processOrder(event, retryEntry.getLastSoapRequest());
    }

    public CmsDashboardSnapshot getDashboardSnapshot() {
        return CmsDashboardSnapshot.builder()
                .connected(mockCmsService.isHealthy())
                .totalSoapRequests(totalSoapRequests.get())
                .successfulRequests(successfulRequests.get())
                .failedRequests(failedRequests.get())
                .retryQueueSize(retryQueue.size())
                .recentEvents(getRecentEvents())
                .retryQueue(getRetryQueue())
                .build();
    }

    public List<CmsEventLogEntry> getRecentEvents() {
        return eventLog.stream().limit(20).toList();
    }

    public List<CmsRetryEntry> getRetryQueue() {
        return retryQueue.values().stream()
                .sorted(Comparator.comparing(CmsRetryEntry::getLastAttemptAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();
    }

    public CmsProcessingResult getLatestResult(String orderNumber) {
        CmsProcessingResult result = latestResults.get(orderNumber);
        if (result == null) {
            throw new IllegalArgumentException("No CMS result found for order " + orderNumber);
        }
        return result;
    }

    public Optional<CmsProcessingResult> getLatestResult() {
        return latestResults.values().stream()
                .reduce((first, second) -> second);
    }

    private CmsProcessingResult processOrder(OrderCreatedEvent event) {
        return processOrder(event, transformer.toSoapXml(event));
    }

    private CmsProcessingResult processOrder(OrderCreatedEvent event, String soapRequest) {
        CmsSoapResponse cmsResponse = null;
        String soapResponse = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            totalSoapRequests.incrementAndGet();
            recordEvent("SOAP Request Sent", "Attempt " + attempt + " for order " + event.getOrderNumber());

            try {
                soapResponse = mockCmsService.processSoapRequest(soapRequest);
                cmsResponse = transformer.fromSoapXml(soapResponse);
                if (cmsResponse.getOrderNumber() == null) {
                    throw new IllegalStateException("Mock CMS returned an invalid response");
                }

                successfulRequests.incrementAndGet();
                retryQueue.remove(event.getOrderNumber());
                recordEvent("CMS Response", "Order " + event.getOrderNumber() + " processed successfully");

                String responseJson = transformer.toJson(cmsResponse);
                CmsProcessingResult result = CmsProcessingResult.builder()
                        .orderNumber(event.getOrderNumber())
                        .success(true)
                        .attempts(attempt)
                        .soapRequest(soapRequest)
                        .soapResponse(soapResponse)
                        .responseJson(responseJson)
                        .message(cmsResponse.getMessage())
                        .queuedForRetry(false)
                        .build();

                latestResults.put(event.getOrderNumber(), result);
                publishCompletedEvent(event, soapRequest, soapResponse, cmsResponse);
                recordEvent("CMSCompleted Published", "Order " + event.getOrderNumber() + " published to RabbitMQ");
                return result;
            } catch (Exception exception) {
                failedRequests.incrementAndGet();
                recordEvent("CMS Response Error", exception.getMessage());

                if (attempt < MAX_RETRIES) {
                    continue;
                }

                CmsRetryEntry retryEntry = CmsRetryEntry.builder()
                        .orderNumber(event.getOrderNumber())
                        .clientId(event.getClientId())
                        .attempts(attempt)
                        .errorMessage(exception.getMessage())
                        .lastSoapRequest(soapRequest)
                        .lastSoapResponse(soapResponse)
                        .lastAttemptAt(LocalDateTime.now())
                        .build();

                retryQueue.put(event.getOrderNumber(), retryEntry);

                CmsProcessingResult result = CmsProcessingResult.builder()
                        .orderNumber(event.getOrderNumber())
                        .success(false)
                        .attempts(attempt)
                        .soapRequest(soapRequest)
                        .soapResponse(soapResponse)
                        .responseJson(null)
                        .message(exception.getMessage())
                        .queuedForRetry(true)
                        .build();

                latestResults.put(event.getOrderNumber(), result);
                return result;
            }
        }

        throw new IllegalStateException("Unable to process CMS request for order " + event.getOrderNumber());
    }

    private void publishCompletedEvent(OrderCreatedEvent orderEvent, String soapRequest, String soapResponse, CmsSoapResponse cmsResponse) {
        CmsCompletedEvent completedEvent = CmsCompletedEvent.builder()
                .orderNumber(orderEvent.getOrderNumber())
                .clientId(orderEvent.getClientId())
                .status(cmsResponse.getStatus())
                .cmsMessage(cmsResponse.getMessage())
                .soapRequest(soapRequest)
                .soapResponse(soapResponse)
                .processedAt(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMqConfig.CMS_COMPLETED_EXCHANGE,
                RabbitMqConfig.CMS_COMPLETED_ROUTING_KEY,
                completedEvent
        );
    }

    private void recordEvent(String event, String details) {
        eventLog.addFirst(CmsEventLogEntry.builder()
                .time(LocalDateTime.now())
                .event(event)
                .details(details)
                .build());

        while (eventLog.size() > MAX_EVENTS) {
            eventLog.removeLast();
        }

        log.info("CMS event [{}]: {}", event, details);
    }
}