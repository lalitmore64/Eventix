package com.eventix.tickets.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportSummaryDTO {
    private UUID eventId;
    private String eventName;
    private Integer totalCapacity; // Sum of capacities. Can be null if any category is unlimited
    private Long totalTicketsSold;
    private Double totalRevenue;
    private Long totalCheckedIn;
    private List<TicketTypeReportDTO> salesByTicketType;
}
