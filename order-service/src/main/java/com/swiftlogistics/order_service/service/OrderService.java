package com.swiftlogistics.order_service.service;

import com.swiftlogistics.order_service.config.RabbitMQConfig;
import com.swiftlogistics.order_service.dto.OrderCreatedEvent;
import com.swiftlogistics.order_service.dto.OrderRequest;
import com.swiftlogistics.order_service.model.Order;
import com.swiftlogistics.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final RabbitTemplate rabbitTemplate;
    private final Random random = new Random();

    @Transactional
    public Order createOrder(OrderRequest request, Long clientId) {
        String orderNumber = "SL-" + (10000000 + random.nextInt(90000000));
        
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .clientId(clientId)
                .description(request.getDescription())
                .senderAddress(request.getSenderAddress())
                .recipientAddress(request.getRecipientAddress())
                .weight(request.getWeight())
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .packageType(request.getPackageType())
                .priority(request.getPriority())
                .deliveryNotes(request.getDeliveryNotes())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        order = orderRepository.save(order);
        log.info("Order saved: {}", order.getOrderNumber());

        // Publish event to RabbitMQ
        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderNumber(order.getOrderNumber())
                .clientId(order.getClientId())
                .description(order.getDescription())
                .senderAddress(order.getSenderAddress())
                .recipientAddress(order.getRecipientAddress())
                .receiverName(order.getReceiverName())
                .weight(order.getWeight())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, event);
        log.info("OrderCreated event published for order: {}", order.getOrderNumber());

        return order;
    }

    public List<Order> getOrderHistory(Long clientId) {
        return orderRepository.findByClientIdOrderByCreatedAtDesc(clientId);
    }

    public Order getOrderStatus(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with number: " + orderNumber));
    }
}
