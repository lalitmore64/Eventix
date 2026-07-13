package com.eventix.tickets.repository;

import com.eventix.tickets.domain.entity.TicketValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TicketValidationRepository extends JpaRepository<TicketValidation, UUID> {
    List<TicketValidation> findByTicketId(UUID ticketId);
    List<TicketValidation> findByTicketTicketTypeEventId(UUID eventId);
}
