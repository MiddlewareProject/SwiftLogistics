package com.swiftlogistics.ROS_Adapter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddDriverRequest {
    @NotBlank(message = "Driver ID is required")
    private String driverId;

    @NotBlank(message = "Driver name is required")
    private String name;
}
