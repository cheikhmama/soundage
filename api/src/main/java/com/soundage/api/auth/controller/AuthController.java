package com.soundage.api.auth.controller;

import com.soundage.api.auth.dto.AuthResponse;
import com.soundage.api.auth.dto.LoginRequest;
import com.soundage.api.auth.dto.RefreshTokenRequest;
import com.soundage.api.auth.dto.SignupRequest;
import com.soundage.api.auth.service.AuthService;
import com.soundage.api.common.response.ApiResponse;
import com.soundage.api.user.dto.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	@PostMapping("/signup")
	public ResponseEntity<ApiResponse<UserDto>> signup(@Valid @RequestBody SignupRequest request) {
		UserDto user = authService.signup(request);
		return ResponseEntity.ok(ApiResponse.success("User registered successfully", user));
	}

	@PostMapping("/login")
	public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
		AuthResponse response = authService.login(request);
		return ResponseEntity.ok(ApiResponse.success("Login successful", response));
	}

	@PostMapping("/refresh")
	public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
		AuthResponse response = authService.refreshToken(request);
		return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
	}
}
