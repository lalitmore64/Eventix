package com.eventix.tickets.controller;

import com.eventix.tickets.dto.ReportSummaryDTO;
import com.eventix.tickets.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/api/v1/events/{eventId}/report")
    public ReportSummaryDTO getEventReportSummary(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal Jwt jwt) {
        String organizerId = jwt.getSubject();
        return reportService.getEventReportSummary(eventId, organizerId);
    }
}
