package com.soundage.api.auth.service;

import com.soundage.api.auth.dto.AuthResponse;
import com.soundage.api.auth.dto.LoginRequest;
import com.soundage.api.auth.dto.RefreshTokenRequest;
import com.soundage.api.auth.dto.SignupRequest;
import com.soundage.api.config.security.JwtService;
import com.soundage.api.user.dto.UserDto;
import com.soundage.api.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserService userService;
	private final JwtService jwtService;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;

	@Transactional
	public UserDto signup(SignupRequest request) {
		String encodedPassword = passwordEncoder.encode(request.getPassword());
		return userService.createUser(
				request.getName(),
				request.getLastName(),
				request.getEmail(),
				encodedPassword,
				request.getRole());
	}

	public AuthResponse login(LoginRequest request) {
		try {
			authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(
							request.getEmail(),
							request.getPassword()));
		} catch (BadCredentialsException e) {
			throw new RuntimeException("Invalid email or password");
		}

		UserDetails userDetails = userService.loadUserByUsername(request.getEmail());
		String accessToken = jwtService.generateToken(userDetails);
		String refreshToken = jwtService.generateRefreshToken(userDetails);

		return AuthResponse.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.build();
	}

	public AuthResponse refreshToken(RefreshTokenRequest request) {
		try {
			String refreshToken = request.getRefreshToken();
			if (!jwtService.isRefreshToken(refreshToken)) {
				throw new RuntimeException("Invalid refresh token");
			}
			String email = jwtService.extractUsername(refreshToken);
			if (email == null) {
				throw new RuntimeException("Invalid refresh token");
			}
			UserDetails userDetails = userService.loadUserByUsername(email);
			if (!jwtService.isTokenValid(refreshToken, userDetails)) {
				throw new RuntimeException("Invalid or expired refresh token");
			}
			String newAccessToken = jwtService.generateToken(userDetails);
			String newRefreshToken = jwtService.generateRefreshToken(userDetails);
			return AuthResponse.builder()
					.accessToken(newAccessToken)
					.refreshToken(newRefreshToken)
					.build();
		} catch (RuntimeException e) {
			throw e;
		} catch (Exception e) {
			throw new RuntimeException("Invalid refresh token");
		}
	}
}
