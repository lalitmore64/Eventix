package com.eventix.tickets.mapper;

import com.eventix.tickets.domain.entity.Event;
import com.eventix.tickets.domain.entity.TicketType;
import com.eventix.tickets.dto.EventDTO;
import com.eventix.tickets.dto.TicketTypeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface EventMapper {

    EventDTO toDto(Event event);

    @Mapping(target = "ticketTypes", ignore = true)
    Event toEntity(EventDTO eventDto);

    TicketTypeDTO toDto(TicketType ticketType);

    TicketType toEntity(TicketTypeDTO ticketTypeDto);

    List<EventDTO> toDtoList(List<Event> events);
}
