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
public class CmsSoapResponse {
    private String orderNumber;
    private String status;
    private String message;
    private LocalDateTime processedAt;
}