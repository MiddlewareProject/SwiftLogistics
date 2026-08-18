package com.swiftlogistics.order_service.service;

import com.swiftlogistics.order_service.dto.AuthResponse;
import com.swiftlogistics.order_service.dto.DriverRegisterRequest;
import com.swiftlogistics.order_service.dto.LoginRequest;
import com.swiftlogistics.order_service.dto.RegisterRequest;
import com.swiftlogistics.order_service.model.User;
import com.swiftlogistics.order_service.repository.UserRepository;
import com.swiftlogistics.order_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role("CLIENT") // Default role
                .build();

        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    public AuthResponse registerDriver(DriverRegisterRequest request) {

        java.util.Optional<User> existingUser = userRepository.findByUsername(request.getDriverId());
        if (existingUser.isPresent()) {
            User existing = existingUser.get();
            if (!"DRIVER".equalsIgnoreCase(existing.getRole())
                    && request.getDriverId().matches("DRV-0[1-5]")) {
                existing.setRole("DRIVER");
                existing.setEmail(request.getEmail());
                existing.setPassword(passwordEncoder.encode(request.getPassword()));
                User repaired = userRepository.save(existing);
                return AuthResponse.builder()
                        .token(jwtUtil.generateToken(repaired))
                        .username(repaired.getUsername())
                        .role(repaired.getRole())
                        .build();
            }
            throw new IllegalArgumentException("Driver ID already exists");
        }

        User driver = User.builder()
                .username(request.getDriverId())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role("DRIVER")
                .build();

        driver = userRepository.save(driver);

        String token = jwtUtil.generateToken(driver);

        return AuthResponse.builder()
                .token(token)
                .username(driver.getUsername())
                .role(driver.getRole())
                .build();
    }


    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }
}
