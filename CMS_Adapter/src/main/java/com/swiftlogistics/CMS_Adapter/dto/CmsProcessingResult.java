package com.swiftlogistics.CMS_Adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CmsProcessingResult {
    private String orderNumber;
    private boolean success;
    private int attempts;
    private String soapRequest;
    private String soapResponse;
    private String responseJson;
    private String message;
    private boolean queuedForRetry;
}