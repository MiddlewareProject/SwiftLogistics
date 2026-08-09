package com.swiftlogistics.WMS_Adapter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WmsStoreResponse {
    private String orderNumber;
    private String packageId;
    private String status;
    private String warehouseLocation;
}
