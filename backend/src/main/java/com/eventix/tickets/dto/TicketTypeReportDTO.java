package com.eventix.tickets.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketTypeReportDTO {
    private UUID ticketTypeId;
    private String name;
    private Double price;
    private Integer totalAvailable; // capacity
    private Long ticketsSold;
    private Double revenue;
    private Long checkedIn;
}
