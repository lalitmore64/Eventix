package com.eventix.tickets.dto;

import com.eventix.tickets.domain.enums.TicketValidationMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationRequestDTO {
    private UUID qrCodeId;
    private TicketValidationMethod validationMethod;
}
