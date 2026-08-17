package com.swiftlogistics.notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverLoginResponse {

    private String token;

    private String driverId;

    private String name;

    private String message;
}