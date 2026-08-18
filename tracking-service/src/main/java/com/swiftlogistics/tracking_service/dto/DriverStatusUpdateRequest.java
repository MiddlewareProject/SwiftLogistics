package com.swiftlogistics.tracking_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DriverStatusUpdateRequest {
    @NotBlank(message = "Status is required")
    private String status;
    private String location;
    private String reason;
    private String note;
}
