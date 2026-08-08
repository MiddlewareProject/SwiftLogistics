package com.swiftlogistics.WMS_Adapter.service;

import com.swiftlogistics.WMS_Adapter.dto.WmsStoreResponse;
import org.springframework.stereotype.Service;

@Service
public class WmsResponseParser {

    public WmsStoreResponse parseStoreResponse(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            throw new IllegalArgumentException("Malformed WMS response: response is blank");
        }

        if (rawResponse.startsWith("ERR|")) {
            throw new IllegalArgumentException("WMS returned error response: " + rawResponse);
        }

        String[] fields = rawResponse.split("\\|", -1);
        if (fields.length != 5 || !"ACK".equals(fields[0])) {
            throw new IllegalArgumentException("Malformed WMS ACK response: " + rawResponse);
        }

        validateField("orderNumber", fields[1], rawResponse);
        validateField("packageId", fields[2], rawResponse);
        validateField("status", fields[3], rawResponse);
        validateField("warehouseLocation", fields[4], rawResponse);

        return WmsStoreResponse.builder()
                .orderNumber(fields[1])
                .packageId(fields[2])
                .status(fields[3])
                .warehouseLocation(fields[4])
                .build();
    }

    private void validateField(String name, String value, String rawResponse) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Malformed WMS ACK response: " + name + " is blank in " + rawResponse);
        }
    }
}
