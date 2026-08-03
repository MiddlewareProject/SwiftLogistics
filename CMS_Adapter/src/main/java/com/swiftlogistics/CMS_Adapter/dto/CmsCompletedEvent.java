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
public class CmsCompletedEvent {
    private String orderNumber;
    private Long clientId;
    private String status;
    private String cmsMessage;
    private String soapRequest;
    private String soapResponse;
    private LocalDateTime processedAt;
}