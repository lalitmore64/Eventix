package com.eventix.tickets.dto;

import com.eventix.tickets.domain.enums.EventStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDTO {
    private UUID id;
    private String name;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String venue;
    private LocalDateTime salesStartDate;
    private LocalDateTime salesEndDate;
    private EventStatusEnum status;
    private String organizerId;
    private List<TicketTypeDTO> ticketTypes;
}
