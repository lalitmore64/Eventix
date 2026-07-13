package com.eventix.tickets.service;

import com.eventix.tickets.domain.entity.Event;
import com.eventix.tickets.domain.entity.TicketType;
import com.eventix.tickets.domain.entity.TicketValidation;
import com.eventix.tickets.domain.enums.TicketStatusEnum;
import com.eventix.tickets.domain.enums.TicketValidationStatusEnum;
import com.eventix.tickets.dto.ReportSummaryDTO;
import com.eventix.tickets.dto.TicketTypeReportDTO;
import com.eventix.tickets.repository.EventRepository;
import com.eventix.tickets.repository.TicketRepository;
import com.eventix.tickets.repository.TicketValidationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final TicketValidationRepository ticketValidationRepository;

    public ReportSummaryDTO getEventReportSummary(UUID eventId, String organizerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (!event.getOrganizerId().equals(organizerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this event");
        }

        List<TicketValidation> successValidations = ticketValidationRepository
                .findByTicketTicketTypeEventId(eventId).stream()
                .filter(v -> v.getStatus() == TicketValidationStatusEnum.SUCCESS)
                .toList();

        List<TicketTypeReportDTO> ticketTypeReports = new ArrayList<>();
        long totalTicketsSold = 0;
        double totalRevenue = 0.0;
        long totalCheckedIn = 0;
        boolean hasUnlimitedCapacity = false;
        int totalCapacity = 0;

        for (TicketType tt : event.getTicketTypes()) {
            long ticketsSold = ticketRepository.countByTicketTypeIdAndStatus(tt.getId(), TicketStatusEnum.PURCHASED);
            double revenue = ticketsSold * tt.getPrice();

            long checkedIn = successValidations.stream()
                    .filter(v -> v.getTicket().getTicketType().getId().equals(tt.getId()))
                    .count();

            ticketTypeReports.add(TicketTypeReportDTO.builder()
                    .ticketTypeId(tt.getId())
                    .name(tt.getName())
                    .price(tt.getPrice())
                    .totalAvailable(tt.getTotalAvailable())
                    .ticketsSold(ticketsSold)
                    .revenue(revenue)
                    .checkedIn(checkedIn)
                    .build());

            totalTicketsSold += ticketsSold;
            totalRevenue += revenue;
            totalCheckedIn += checkedIn;

            if (tt.getTotalAvailable() == null) {
                hasUnlimitedCapacity = true;
            } else {
                totalCapacity += tt.getTotalAvailable();
            }
        }

        return ReportSummaryDTO.builder()
                .eventId(event.getId())
                .eventName(event.getName())
                .totalCapacity(hasUnlimitedCapacity ? null : totalCapacity)
                .totalTicketsSold(totalTicketsSold)
                .totalRevenue(totalRevenue)
                .totalCheckedIn(totalCheckedIn)
                .salesByTicketType(ticketTypeReports)
                .build();
    }
}
