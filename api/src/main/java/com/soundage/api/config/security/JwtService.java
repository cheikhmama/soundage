package com.soundage.api.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

	public static final String CLAIM_TOKEN_TYPE = "type";
	public static final String TOKEN_TYPE_ACCESS = "access";
	public static final String TOKEN_TYPE_REFRESH = "refresh";

	@Value("${jwt.secret:your-256-bit-secret-key-must-be-at-least-32-characters-long}")
	private String secret;

	@Value("${jwt.expiration:86400000}")
	private Long expiration;

	@Value("${jwt.refresh-expiration:604800000}")
	private Long refreshExpiration;

	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}

	public String generateToken(UserDetails userDetails) {
		return generateToken(new HashMap<>(), userDetails);
	}

	public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>(extraClaims);
		claims.put(CLAIM_TOKEN_TYPE, TOKEN_TYPE_ACCESS);
		return buildToken(claims, userDetails, expiration);
	}

	public String generateRefreshToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		claims.put(CLAIM_TOKEN_TYPE, TOKEN_TYPE_REFRESH);
		return buildToken(claims, userDetails, refreshExpiration);
	}

	/**
	 * Returns true only if the token has type=refresh. Rejects access tokens and
	 * malformed tokens.
	 */
	public boolean isRefreshToken(String token) {
		try {
			String type = extractClaim(token, claims -> claims.get(CLAIM_TOKEN_TYPE, String.class));
			return TOKEN_TYPE_REFRESH.equals(type);
		} catch (Exception e) {
			return false;
		}
	}

	/**
	 * Returns true if the token is an access token (or legacy token without type).
	 * Rejects refresh tokens for API access.
	 */
	public boolean isAccessToken(String token) {
		try {
			String type = extractClaim(token, claims -> claims.get(CLAIM_TOKEN_TYPE, String.class));
			return type == null || TOKEN_TYPE_ACCESS.equals(type);
		} catch (Exception e) {
			return false;
		}
	}

	private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
		return Jwts.builder()
				.claims(extraClaims)
				.subject(userDetails.getUsername())
				.issuedAt(new Date(System.currentTimeMillis()))
				.expiration(new Date(System.currentTimeMillis() + expiration))
				.signWith(getSigningKey())
				.compact();
	}

	public boolean isTokenValid(String token, UserDetails userDetails) {
		final String username = extractUsername(token);
		return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
	}

	private boolean isTokenExpired(String token) {
		return extractExpiration(token).before(new Date());
	}

	private Date extractExpiration(String token) {
		return extractClaim(token, Claims::getExpiration);
	}

	private Claims extractAllClaims(String token) {
		return Jwts.parser()
				.verifyWith(getSigningKey())
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	private SecretKey getSigningKey() {
		byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
		return Keys.hmacShaKeyFor(keyBytes);
	}
}
