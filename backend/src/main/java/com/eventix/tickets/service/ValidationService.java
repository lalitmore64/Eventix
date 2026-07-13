package com.eventix.tickets.service;

import com.eventix.tickets.domain.entity.QrCode;
import com.eventix.tickets.domain.entity.Ticket;
import com.eventix.tickets.domain.entity.TicketValidation;
import com.eventix.tickets.domain.enums.QrCodeStatusEnum;
import com.eventix.tickets.domain.enums.TicketStatusEnum;
import com.eventix.tickets.domain.enums.TicketValidationStatusEnum;
import com.eventix.tickets.dto.ValidationRequestDTO;
import com.eventix.tickets.dto.ValidationResponseDTO;
import com.eventix.tickets.repository.QrCodeRepository;
import com.eventix.tickets.repository.TicketValidationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ValidationService {

    private final QrCodeRepository qrCodeRepository;
    private final TicketValidationRepository ticketValidationRepository;

    public ValidationResponseDTO validateTicket(ValidationRequestDTO request, String staffId) {
        UUID qrCodeId = request.getQrCodeId();
        LocalDateTime now = LocalDateTime.now();

        var qrCodeOpt = qrCodeRepository.findById(qrCodeId);
        if (qrCodeOpt.isEmpty()) {
            return ValidationResponseDTO.builder()
                    .status(TicketValidationStatusEnum.FAILED)
                    .message("Invalid ticket: QR Code does not exist")
                    .build();
        }

        QrCode qrCode = qrCodeOpt.get();
        Ticket ticket = qrCode.getTicket();

        if (qrCode.getStatus() != QrCodeStatusEnum.ACTIVE) {
            logValidation(ticket, TicketValidationStatusEnum.FAILED, request, staffId, now);
            return buildResponse(TicketValidationStatusEnum.FAILED, "Invalid ticket: QR Code is revoked", ticket);
        }

        if (ticket.getStatus() != TicketStatusEnum.PURCHASED) {
            logValidation(ticket, TicketValidationStatusEnum.FAILED, request, staffId, now);
            return buildResponse(TicketValidationStatusEnum.FAILED, "Invalid ticket: Ticket has been cancelled", ticket);
        }

        List<TicketValidation> pastValidations = ticketValidationRepository.findByTicketId(ticket.getId());
        boolean alreadyValidated = pastValidations.stream()
                .anyMatch(v -> v.getStatus() == TicketValidationStatusEnum.SUCCESS);

        if (alreadyValidated) {
            logValidation(ticket, TicketValidationStatusEnum.FAILED, request, staffId, now);
            return buildResponse(TicketValidationStatusEnum.FAILED, "Duplicate use: Ticket was already scanned and used", ticket);
        }

        logValidation(ticket, TicketValidationStatusEnum.SUCCESS, request, staffId, now);
        return buildResponse(TicketValidationStatusEnum.SUCCESS, "Ticket validated successfully", ticket);
    }

    private void logValidation(Ticket ticket, TicketValidationStatusEnum status, ValidationRequestDTO request, String staffId, LocalDateTime time) {
        TicketValidation validation = TicketValidation.builder()
                .ticket(ticket)
                .status(status)
                .validationTime(time)
                .validationMethod(request.getValidationMethod())
                .validatedBy(staffId)
                .build();
        ticketValidationRepository.save(validation);
    }

    private ValidationResponseDTO buildResponse(TicketValidationStatusEnum status, String message, Ticket ticket) {
        return ValidationResponseDTO.builder()
                .status(status)
                .message(message)
                .ticketId(ticket.getId())
                .eventName(ticket.getTicketType().getEvent().getName())
                .ticketTypeName(ticket.getTicketType().getName())
                .purchaserId(ticket.getPurchaserId())
                .build();
    }
}
