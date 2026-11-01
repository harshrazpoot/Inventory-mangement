package com.example.order_craft;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private final Key secretKey;
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 Hours valid

    public JwtUtil(@Value("${app.jwt.secret:}") String secret) {
        this.secretKey = secret.isBlank()
                ? Keys.secretKeyFor(SignatureAlgorithm.HS256)
                : Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
        return claimsResolver.apply(claims);
    }

    public boolean validateToken(String token, String username) {
        return (username.equals(extractUsername(token)) && !extractExpiration(token).before(new Date()));
    }
}