package com.swiftlogistics.CMS_Adapter.controller;

import com.swiftlogistics.CMS_Adapter.dto.CmsDashboardSnapshot;
import com.swiftlogistics.CMS_Adapter.dto.CmsEventLogEntry;
import com.swiftlogistics.CMS_Adapter.dto.CmsProcessingResult;
import com.swiftlogistics.CMS_Adapter.dto.CmsRetryEntry;
import com.swiftlogistics.CMS_Adapter.service.CmsIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cms")
@RequiredArgsConstructor
public class CmsMonitoringController {
    private final CmsIntegrationService cmsIntegrationService;

    @GetMapping("/dashboard")
    public CmsDashboardSnapshot dashboard() {
        return cmsIntegrationService.getDashboardSnapshot();
    }

    @GetMapping("/status")
    public ResponseEntity<String> status() {
        return ResponseEntity.ok(cmsIntegrationService.getDashboardSnapshot().isConnected() ? "Connected" : "Disconnected");
    }

    @GetMapping("/events")
    public List<CmsEventLogEntry> events() {
        return cmsIntegrationService.getRecentEvents();
    }

    @GetMapping("/retries")
    public List<CmsRetryEntry> retries() {
        return cmsIntegrationService.getRetryQueue();
    }

    @GetMapping("/orders/{orderNumber}")
    public CmsProcessingResult latestResult(@PathVariable String orderNumber) {
        return cmsIntegrationService.getLatestResult(orderNumber);
    }

    @GetMapping("/latest")
    public ResponseEntity<CmsProcessingResult> latest() {
        return ResponseEntity.of(cmsIntegrationService.getLatestResult());
    }

    @PostMapping("/retries/{orderNumber}")
    public CmsProcessingResult retry(@PathVariable String orderNumber) {
        return cmsIntegrationService.retryOrder(orderNumber);
    }
}