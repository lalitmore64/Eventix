package com.eventix.tickets.dto;

import com.eventix.tickets.domain.enums.TicketValidationStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationResponseDTO {
    private TicketValidationStatusEnum status;
    private String message;
    private UUID ticketId;
    private String eventName;
    private String ticketTypeName;
    private String purchaserId;
}
