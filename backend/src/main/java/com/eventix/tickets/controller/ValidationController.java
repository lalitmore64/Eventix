package com.eventix.tickets.controller;

import com.eventix.tickets.dto.ValidationRequestDTO;
import com.eventix.tickets.dto.ValidationResponseDTO;
import com.eventix.tickets.service.ValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ValidationController {

    private final ValidationService validationService;

    @PostMapping("/api/v1/tickets/validate")
    public ValidationResponseDTO validateTicket(
            @RequestBody ValidationRequestDTO request,
            @AuthenticationPrincipal Jwt jwt) {
        String staffId = jwt.getSubject();
        return validationService.validateTicket(request, staffId);
    }
}
