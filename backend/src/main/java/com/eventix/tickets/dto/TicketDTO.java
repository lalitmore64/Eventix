package com.eventix.tickets.dto;

import com.eventix.tickets.domain.enums.TicketStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketDTO {
    private UUID id;
    private String purchaserId;
    private TicketStatusEnum status;
    private LocalDateTime createdDateTime;

    private UUID ticketTypeId;
    private String ticketTypeName;
    private Double ticketTypePrice;

    private UUID eventId;
    private String eventName;
    private LocalDateTime eventStartDateTime;
    private LocalDateTime eventEndDateTime;
    private String eventVenue;

    private QrCodeDTO qrCode;
}
