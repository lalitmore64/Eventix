package com.eventix.tickets.domain.entity;

import com.eventix.tickets.domain.enums.EventStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "events", indexes = {
        @Index(name = "idx_events_organizer_id", columnList = "organizerId"),
        @Index(name = "idx_events_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "ticketTypes")
@EqualsAndHashCode(exclude = "ticketTypes")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDateTime startDateTime;

    @Column(nullable = false)
    private LocalDateTime endDateTime;

    @Column(nullable = false)
    private String venue;

    private LocalDateTime salesStartDate;

    private LocalDateTime salesEndDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatusEnum status;

    @Column(nullable = false)
    private String organizerId;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TicketType> ticketTypes = new ArrayList<>();

    public void addTicketType(TicketType ticketType) {
        ticketTypes.add(ticketType);
        ticketType.setEvent(this);
    }
}
