package com.eventix.tickets.repository;

import com.eventix.tickets.domain.entity.Ticket;
import com.eventix.tickets.domain.enums.TicketStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findByPurchaserId(String purchaserId);
    List<Ticket> findByPurchaserIdAndStatus(String purchaserId, TicketStatusEnum status);
    List<Ticket> findByTicketTypeEventId(UUID eventId);
    List<Ticket> findByPaymentOrderId(String paymentOrderId);
    long countByTicketTypeIdAndStatus(UUID ticketTypeId, TicketStatusEnum status);
    long countByTicketTypeIdAndStatusAndCreatedDateTimeAfter(UUID ticketTypeId, TicketStatusEnum status, java.time.LocalDateTime time);
}
