package com.swiftlogistics.order_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DriverRegisterRequest {

    @NotBlank(message = "Driver ID is required")
    @Size(min = 3, max = 50, message = "Driver ID must be between 3 and 50 characters")
    private String driverId;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
}