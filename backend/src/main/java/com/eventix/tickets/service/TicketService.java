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
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final EventRepository eventRepository;
    private final TicketMapper ticketMapper;
    private final RazorpayService razorpayService;

    public PurchaseResponseDTO initiateTicketPurchase(PurchaseRequestDTO purchaseRequest, String purchaserId) {
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

        LocalDateTime now = LocalDateTime.now();
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

        if (isFree) {
            List<Ticket> savedTickets = new ArrayList<>();
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

            return PurchaseResponseDTO.builder()
                    .isFree(true)
                    .tickets(ticketMapper.toDtoList(savedTickets))
                    .build();
        } else {
            try {
                String receipt = "txn_" + UUID.randomUUID().toString().substring(0, 8);
                com.razorpay.Order order = razorpayService.createOrder(totalPrice, "INR", receipt);
                String orderId = order.get("id");
                long amountInPaise = ((Number) order.get("amount")).longValue();

                List<Ticket> savedTickets = new ArrayList<>();
                for (int i = 0; i < quantity; i++) {
                    Ticket ticket = Ticket.builder()
                            .purchaserId(purchaserId)
                            .status(TicketStatusEnum.PENDING_PAYMENT)
                            .paymentOrderId(orderId)
                            .createdDateTime(now)
                            .ticketType(ticketType)
                            .build();
                    savedTickets.add(ticketRepository.save(ticket));
                }

                return PurchaseResponseDTO.builder()
                        .paymentOrderId(orderId)
                        .amount(amountInPaise)
                        .currency("INR")
                        .razorpayKey(razorpayService.getKeyId())
                        .isFree(false)
                        .tickets(ticketMapper.toDtoList(savedTickets))
                        .build();
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to initiate payment: " + e.getMessage(), e);
            }
        }
    }

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
