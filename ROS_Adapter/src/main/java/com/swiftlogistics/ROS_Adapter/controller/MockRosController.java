package com.swiftlogistics.ROS_Adapter.controller;

import com.swiftlogistics.ROS_Adapter.dto.OrderCreatedEvent;
import com.swiftlogistics.ROS_Adapter.dto.RouteResult;
import com.swiftlogistics.ROS_Adapter.service.MockRosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mock-ros")
@RequiredArgsConstructor
public class MockRosController {
    private final MockRosService mockRosService;

    @PostMapping("/optimize")
    public ResponseEntity<RouteResult> optimize(@RequestBody OrderCreatedEvent orderCreatedEvent) {
        return ResponseEntity.ok(mockRosService.generateRoute(orderCreatedEvent));
    }
}
