package com.swiftlogistics.order_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class OrderRequest {
    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Sender address is required")
    private String senderAddress;

    @NotBlank(message = "Recipient address is required")
    private String recipientAddress;

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.01", message = "Weight must be greater than 0")
    private Double weight;

    @NotBlank(message = "Receiver name is required")
    private String receiverName;

    @NotBlank(message = "Receiver phone is required")
    private String receiverPhone;

    private String packageType;

    private String priority;

    private String deliveryNotes;
}
