package com.eventix.tickets.domain.entity;

import com.eventix.tickets.domain.enums.TicketValidationMethod;
import com.eventix.tickets.domain.enums.TicketValidationStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ticket_validations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "ticket")
@EqualsAndHashCode(exclude = "ticket")
public class TicketValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketValidationStatusEnum status;

    @Column(nullable = false)
    private LocalDateTime validationTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketValidationMethod validationMethod;

    @Column(nullable = false)
    private String validatedBy;
}
