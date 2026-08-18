package com.swiftlogistics.ROS_Adapter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddVehicleRequest {
    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    @NotBlank(message = "Vehicle plate is required")
    private String vehiclePlate;

    @NotBlank(message = "Vehicle type is required")
    private String vehicleType;
}
