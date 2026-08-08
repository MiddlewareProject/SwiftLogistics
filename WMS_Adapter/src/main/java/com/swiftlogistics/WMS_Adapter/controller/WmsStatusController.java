package com.swiftlogistics.WMS_Adapter.controller;

import com.swiftlogistics.WMS_Adapter.dto.WmsTcpStatusResponse;
import com.swiftlogistics.WMS_Adapter.service.WmsTcpClient;
import com.swiftlogistics.WMS_Adapter.service.WmsTcpStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wms")
@RequiredArgsConstructor
public class WmsStatusController {
    private final WmsTcpClient wmsTcpClient;
    private final WmsTcpStatusService wmsTcpStatusService;

    @GetMapping("/status")
    public ResponseEntity<WmsTcpStatusResponse> getStatus() {
        return ResponseEntity.ok(wmsTcpStatusService.getStatus(wmsTcpClient.getHost(), wmsTcpClient.getPort()));
    }
}
