package com.swiftlogistics.order_service.controller;

import com.swiftlogistics.order_service.dto.AuthResponse;
import com.swiftlogistics.order_service.dto.DriverRegisterRequest;
import com.swiftlogistics.order_service.dto.LoginRequest;
import com.swiftlogistics.order_service.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthControllerTest {
    private final UserService userService = mock(UserService.class);
    private final AuthController controller = new AuthController(userService);

    @Test
    void missingAuthenticationCannotRegisterDriver() {
        DriverRegisterRequest request = driverRequest();

        var response = controller.registerDriver(null, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(userService, never()).registerDriver(request);
    }

    @Test
    void clientCannotRegisterDriver() {
        DriverRegisterRequest request = driverRequest();

        var response = controller.registerDriver("CLIENT", request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(userService, never()).registerDriver(request);
    }

    @Test
    void adminCanRegisterDriver() {
        DriverRegisterRequest request = driverRequest();
        when(userService.registerDriver(request)).thenReturn(AuthResponse.builder()
                .username("DRV-01")
                .role("DRIVER")
                .token("token")
                .build());

        var response = controller.registerDriver("ADMIN", request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(userService).registerDriver(request);
    }

    @Test
    void publicLoginStillWorks() {
        LoginRequest request = new LoginRequest();
        request.setUsername("user1@gmail.com");
        request.setPassword("test123");
        when(userService.login(request)).thenReturn(AuthResponse.builder()
                .username("user1@gmail.com")
                .role("CLIENT")
                .token("token")
                .build());

        var response = controller.login(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(userService).login(request);
    }

    private DriverRegisterRequest driverRequest() {
        DriverRegisterRequest request = new DriverRegisterRequest();
        request.setDriverId("DRV-01");
        request.setEmail("drv-01@swiftlogistics.com");
        request.setPassword("driver123");
        return request;
    }
}
