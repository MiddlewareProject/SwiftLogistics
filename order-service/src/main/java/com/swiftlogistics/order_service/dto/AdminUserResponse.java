package com.swiftlogistics.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
}
