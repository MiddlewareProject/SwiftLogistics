package com.swiftlogistics.CMS_Adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CmsDashboardSnapshot {
    private boolean connected;
    private long totalSoapRequests;
    private long successfulRequests;
    private long failedRequests;
    private int retryQueueSize;
    private List<CmsEventLogEntry> recentEvents;
    private List<CmsRetryEntry> retryQueue;
}