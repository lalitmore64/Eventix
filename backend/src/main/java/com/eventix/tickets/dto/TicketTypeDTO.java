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
public class TicketTypeDTO {
    private UUID id;
    private String name;
    private Double price;
    private Integer totalAvailable;
}
