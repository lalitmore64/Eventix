package com.eventix.tickets.controller;

import com.eventix.tickets.dto.PurchaseRequestDTO;
import com.eventix.tickets.dto.PurchaseResponseDTO;
import com.eventix.tickets.dto.PaymentVerificationRequestDTO;
import com.eventix.tickets.dto.TicketDTO;
import com.eventix.tickets.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping("/api/v1/tickets/purchase")
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseResponseDTO purchaseTickets(
            @RequestBody PurchaseRequestDTO purchaseRequest,
            @AuthenticationPrincipal Jwt jwt) {
        String purchaserId = jwt.getSubject();
        return ticketService.initiateTicketPurchase(purchaseRequest, purchaserId);
    }

    @PostMapping("/api/v1/tickets/purchase/verify")
    public List<TicketDTO> verifyPayment(
            @RequestBody PaymentVerificationRequestDTO verificationRequest,
            @AuthenticationPrincipal Jwt jwt) {
        String purchaserId = jwt.getSubject();
        return ticketService.verifyPayment(verificationRequest, purchaserId);
    }

    @GetMapping("/api/v1/tickets")
    public List<TicketDTO> getAttendeeTickets(@AuthenticationPrincipal Jwt jwt) {
        String purchaserId = jwt.getSubject();
        return ticketService.getAttendeeTickets(purchaserId);
    }

    @GetMapping("/api/v1/tickets/{ticketId}")
    public TicketDTO getTicket(@PathVariable UUID ticketId, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ticketService.getTicket(ticketId, userId);
    }

    @GetMapping("/api/v1/events/{eventId}/tickets")
    public List<TicketDTO> getEventSales(@PathVariable UUID eventId, @AuthenticationPrincipal Jwt jwt) {
        String organizerId = jwt.getSubject();
        return ticketService.getEventSales(eventId, organizerId);
    }
}
