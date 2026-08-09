package com.swiftlogistics.tracking_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotBlank(message = "Status is required")
    private String status;
    private String location;
    private String description;
}
