package com.swiftlogistics.order_service.service;

import com.swiftlogistics.order_service.dto.AdminOrderResponse;
import com.swiftlogistics.order_service.dto.AdminStatsResponse;
import com.swiftlogistics.order_service.dto.AdminUserResponse;
import com.swiftlogistics.order_service.dto.DailyOrderCount;
import com.swiftlogistics.order_service.model.Order;
import com.swiftlogistics.order_service.model.User;
import com.swiftlogistics.order_service.repository.OrderRepository;
import com.swiftlogistics.order_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class AdminStatsService {
    private static final int DAILY_ORDERS_WINDOW = 7;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public AdminStatsResponse getStats() {
        List<Order> orders = orderRepository.findAll();

        Map<LocalDate, Long> ordersByDate = orders.stream()
                .filter(order -> order.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        order -> order.getCreatedAt().toLocalDate(),
                        Collectors.counting()
                ));

        LocalDate today = LocalDate.now();
        List<DailyOrderCount> dailyOrders = Stream.iterate(today.minusDays(DAILY_ORDERS_WINDOW - 1L), date -> date.plusDays(1))
                .limit(DAILY_ORDERS_WINDOW)
                .map(date -> DailyOrderCount.builder()
                        .date(date.format(DATE_FORMAT))
                        .count(ordersByDate.getOrDefault(date, 0L))
                        .build())
                .toList();

        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalOrders(orders.size())
                .totalDrivers(userRepository.countByRole("DRIVER"))
                .dailyOrders(dailyOrders)
                .build();
    }

    public List<AdminUserResponse> getUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getId))
                .map(user -> AdminUserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .toList();
    }

    public List<AdminOrderResponse> getOrders() {
        Map<Long, String> usernamesById = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));

        return orderRepository.findAll().stream()
                .sorted(Comparator.comparing(Order::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(order -> AdminOrderResponse.builder()
                        .id(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .clientUsername(usernamesById.getOrDefault(order.getClientId(), "Unknown"))
                        .description(order.getDescription())
                        .senderAddress(order.getSenderAddress())
                        .recipientAddress(order.getRecipientAddress())
                        .weight(order.getWeight())
                        .status(order.getStatus())
                        .createdAt(order.getCreatedAt())
                        .build())
                .toList();
    }
}
