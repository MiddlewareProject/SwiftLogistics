package com.swiftlogistics.CMS_Adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CmsRetryEntry {
    private String orderNumber;
    private Long clientId;
    private int attempts;
    private String errorMessage;
    private String lastSoapRequest;
    private String lastSoapResponse;
    private LocalDateTime lastAttemptAt;
}