package com.eventix.tickets.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseResponseDTO {
    private String paymentOrderId;
    private Long amount; // in paisa
    private String currency;
    private String razorpayKey;
    private boolean isFree;
    private List<TicketDTO> tickets;
}
