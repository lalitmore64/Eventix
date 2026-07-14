package com.eventix.tickets.service;

import com.eventix.tickets.domain.entity.Event;
import com.eventix.tickets.domain.entity.QrCode;
import com.eventix.tickets.domain.entity.Ticket;
import com.eventix.tickets.domain.entity.TicketType;
import com.eventix.tickets.domain.enums.EventStatusEnum;
import com.eventix.tickets.domain.enums.QrCodeStatusEnum;
import com.eventix.tickets.domain.enums.TicketStatusEnum;
import com.eventix.tickets.dto.PurchaseRequestDTO;
import com.eventix.tickets.repository.EventRepository;
import com.eventix.tickets.repository.TicketRepository;
import com.eventix.tickets.repository.TicketTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketReservationHelper {

    private final TicketRepository ticketRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final EventRepository eventRepository;

    public List<Ticket> reserveTickets(PurchaseRequestDTO purchaseRequest, String purchaserId, LocalDateTime now) {
        UUID ticketTypeId = purchaseRequest.getTicketTypeId();
        int quantity = purchaseRequest.getQuantity() != null ? purchaseRequest.getQuantity() : 1;

        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than 0");
        }

        TicketType ticketType = ticketTypeRepository.findByIdForUpdate(ticketTypeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket type not found"));

        Event event = ticketType.getEvent();

        if (event.getStatus() != EventStatusEnum.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event is not published");
        }

        if (event.getSalesStartDate() != null && now.isBefore(event.getSalesStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticket sales have not started yet");
        }
        if (event.getSalesEndDate() != null && now.isAfter(event.getSalesEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticket sales have ended");
        }

        if (ticketType.getTotalAvailable() != null) {
            long sold = ticketRepository.countByTicketTypeIdAndStatus(ticketTypeId, TicketStatusEnum.PURCHASED);
            long pending = ticketRepository.countByTicketTypeIdAndStatusAndCreatedDateTimeAfter(
                    ticketTypeId,
                    TicketStatusEnum.PENDING_PAYMENT,
                    now.minusMinutes(10)
            );
            if (sold + pending + quantity > ticketType.getTotalAvailable()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough tickets available");
            }
        }

        double totalPrice = ticketType.getPrice() * quantity;
        boolean isFree = totalPrice <= 0;

        List<Ticket> savedTickets = new ArrayList<>();
        if (isFree) {
            for (int i = 0; i < quantity; i++) {
                Ticket ticket = Ticket.builder()
                        .purchaserId(purchaserId)
                        .status(TicketStatusEnum.PURCHASED)
                        .createdDateTime(now)
                        .ticketType(ticketType)
                        .build();

                QrCode qrCode = QrCode.builder()
                        .generatedTime(now)
                        .status(QrCodeStatusEnum.ACTIVE)
                        .build();

                ticket.setQrCode(qrCode);
                savedTickets.add(ticketRepository.save(ticket));
            }
        } else {
            for (int i = 0; i < quantity; i++) {
                Ticket ticket = Ticket.builder()
                        .purchaserId(purchaserId)
                        .status(TicketStatusEnum.PENDING_PAYMENT)
                        .createdDateTime(now)
                        .ticketType(ticketType)
                        .build();
                savedTickets.add(ticketRepository.save(ticket));
            }
        }
        return savedTickets;
    }

    public void updatePaymentOrderId(List<Ticket> tickets, String orderId) {
        for (Ticket ticket : tickets) {
            ticket.setPaymentOrderId(orderId);
            ticketRepository.save(ticket);
        }
    }

    public void cancelReservation(List<Ticket> tickets) {
        ticketRepository.deleteAll(tickets);
    }
}
