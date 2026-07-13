package com.eventix.tickets.service;

import com.eventix.tickets.domain.entity.User;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    @Value("${jwt.secret:yourSuperSecretSigningKeyAtLeast256BitsLongForHMACSHA256SignatureVerification!}")
    private String jwtSecret;

    public String generateToken(User user) {
        try {
            JWSSigner signer = new MACSigner(jwtSecret.getBytes());
            
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getId().toString())
                    .claim("username", user.getUsername())
                    .claim("email", user.getEmail())
                    .claim("roles", List.of(user.getRole().name()))
                    .issueTime(new Date())
                    .expirationTime(new Date(System.currentTimeMillis() + 86400000)) // 24 hours
                    .build();

            SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claimsSet);
            signedJWT.sign(signer);
            
            return signedJWT.serialize();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }
}
