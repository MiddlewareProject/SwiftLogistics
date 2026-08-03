package com.swiftlogistics.CMS_Adapter.controller;

import com.swiftlogistics.CMS_Adapter.service.MockCmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mock-cms")
@RequiredArgsConstructor
public class MockCmsController {
    private final MockCmsService mockCmsService;

    @PostMapping(value = "/soap", consumes = MediaType.TEXT_XML_VALUE, produces = MediaType.TEXT_XML_VALUE)
    public ResponseEntity<String> submit(@RequestBody String soapRequest) {
        return ResponseEntity.ok(mockCmsService.processSoapRequest(soapRequest));
    }
}