package com.eventix.tickets.mapper;

import com.eventix.tickets.domain.entity.Ticket;
import com.eventix.tickets.domain.entity.QrCode;
import com.eventix.tickets.dto.TicketDTO;
import com.eventix.tickets.dto.QrCodeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface TicketMapper {

    @Mapping(source = "ticketType.id", target = "ticketTypeId")
    @Mapping(source = "ticketType.name", target = "ticketTypeName")
    @Mapping(source = "ticketType.price", target = "ticketTypePrice")
    @Mapping(source = "ticketType.event.id", target = "eventId")
    @Mapping(source = "ticketType.event.name", target = "eventName")
    @Mapping(source = "ticketType.event.startDateTime", target = "eventStartDateTime")
    @Mapping(source = "ticketType.event.endDateTime", target = "eventEndDateTime")
    @Mapping(source = "ticketType.event.venue", target = "eventVenue")
    TicketDTO toDto(Ticket ticket);

    QrCodeDTO toDto(QrCode qrCode);

    List<TicketDTO> toDtoList(List<Ticket> tickets);
}
