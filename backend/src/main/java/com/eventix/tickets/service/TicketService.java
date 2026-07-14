package com.eventix.tickets.service;

import com.eventix.tickets.domain.entity.Event;
import com.eventix.tickets.domain.entity.QrCode;
import com.eventix.tickets.domain.entity.Ticket;
import com.eventix.tickets.domain.entity.TicketType;
import com.eventix.tickets.domain.enums.EventStatusEnum;
import com.eventix.tickets.domain.enums.QrCodeStatusEnum;
import com.eventix.tickets.domain.enums.TicketStatusEnum;
import com.eventix.tickets.dto.PurchaseRequestDTO;
import com.eventix.tickets.dto.PurchaseResponseDTO;
import com.eventix.tickets.dto.PaymentVerificationRequestDTO;
import com.eventix.tickets.dto.TicketDTO;
import com.eventix.tickets.mapper.TicketMapper;
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
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final EventRepository eventRepository;
    private final TicketMapper ticketMapper;
    private final RazorpayService razorpayService;
    private final TicketReservationHelper ticketReservationHelper;

    public PurchaseResponseDTO initiateTicketPurchase(PurchaseRequestDTO purchaseRequest, String purchaserId) {
        LocalDateTime now = LocalDateTime.now();

        // 1. Reserve tickets inside a short database transaction
        List<Ticket> savedTickets = ticketReservationHelper.reserveTickets(purchaseRequest, purchaserId, now);

        if (savedTickets.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No tickets were created");
        }

        // Check if the tickets are free (determined by status being PURCHASED directly from reserveTickets)
        boolean isFree = savedTickets.get(0).getStatus() == TicketStatusEnum.PURCHASED;

        if (isFree) {
            return PurchaseResponseDTO.builder()
                    .isFree(true)
                    .tickets(ticketMapper.toDtoList(savedTickets))
                    .build();
        } else {
            // 2. Non-free ticket: Initiate Razorpay order creation (OUTSIDE database transaction)
            Ticket firstTicket = savedTickets.get(0);
            TicketType ticketType = firstTicket.getTicketType();
            double totalPrice = ticketType.getPrice() * savedTickets.size();

            try {
                String receipt = "txn_" + UUID.randomUUID().toString().substring(0, 8);
                com.razorpay.Order order = razorpayService.createOrder(totalPrice, "INR", receipt);
                String orderId = order.get("id");
                long amountInPaise = ((Number) order.get("amount")).longValue();

                // 3. Update tickets with paymentOrderId inside a short transaction
                ticketReservationHelper.updatePaymentOrderId(savedTickets, orderId);

                return PurchaseResponseDTO.builder()
                        .paymentOrderId(orderId)
                        .amount(amountInPaise)
                        .currency("INR")
                        .razorpayKey(razorpayService.getKeyId())
                        .isFree(false)
                        .tickets(ticketMapper.toDtoList(savedTickets))
                        .build();
            } catch (Exception e) {
                // Compensating action: Release/delete the reserved tickets immediately in a short transaction
                try {
                    ticketReservationHelper.cancelReservation(savedTickets);
                } catch (Exception ex) {
                    // Log the failure to release, but propagate the original payment exception
                }
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to initiate payment: " + e.getMessage(), e);
            }
        }
    }

    @Transactional
    public List<TicketDTO> verifyPayment(PaymentVerificationRequestDTO verificationRequest, String purchaserId) {
        String orderId = verificationRequest.getRazorpayOrderId();
        String paymentId = verificationRequest.getRazorpayPaymentId();
        String signature = verificationRequest.getRazorpaySignature();

        boolean isValid = razorpayService.verifySignature(orderId, paymentId, signature);
        if (!isValid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment signature verification failed");
        }

        List<Ticket> tickets = ticketRepository.findByPaymentOrderId(orderId);
        if (tickets.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No tickets found for the given payment order ID");
        }

        List<Ticket> updatedTickets = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (Ticket ticket : tickets) {
            if (!ticket.getPurchaserId().equals(purchaserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to these tickets");
            }
            if (ticket.getStatus() == TicketStatusEnum.PENDING_PAYMENT) {
                ticket.setStatus(TicketStatusEnum.PURCHASED);
                ticket.setPaymentId(paymentId);

                QrCode qrCode = QrCode.builder()
                        .generatedTime(now)
                        .status(QrCodeStatusEnum.ACTIVE)
                        .build();
                ticket.setQrCode(qrCode);
                updatedTickets.add(ticketRepository.save(ticket));
            } else {
                updatedTickets.add(ticket);
            }
        }

        return ticketMapper.toDtoList(updatedTickets);
    }

    @Transactional(readOnly = true)
    public List<TicketDTO> getAttendeeTickets(String purchaserId) {
        List<Ticket> tickets = ticketRepository.findByPurchaserIdAndStatus(purchaserId, TicketStatusEnum.PURCHASED);
        return ticketMapper.toDtoList(tickets);
    }

    @Transactional(readOnly = true)
    public TicketDTO getTicket(UUID ticketId, String userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        boolean isOwner = ticket.getPurchaserId().equals(userId);
        boolean isOrganizer = ticket.getTicketType().getEvent().getOrganizerId().equals(userId);

        if (!isOwner && !isOrganizer) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this ticket");
        }

        return ticketMapper.toDto(ticket);
    }

    @Transactional(readOnly = true)
    public List<TicketDTO> getEventSales(UUID eventId, String organizerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (!event.getOrganizerId().equals(organizerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this event");
        }

        List<Ticket> tickets = ticketRepository.findByTicketTypeEventId(eventId);
        return ticketMapper.toDtoList(tickets);
    }
}
