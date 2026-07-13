package com.eventix.tickets.service;

import com.eventix.tickets.domain.entity.Event;
import com.eventix.tickets.domain.entity.TicketType;
import com.eventix.tickets.domain.enums.EventStatusEnum;
import com.eventix.tickets.dto.EventDTO;
import com.eventix.tickets.mapper.EventMapper;
import com.eventix.tickets.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    public EventDTO createEvent(EventDTO eventDto, String organizerId) {
        Event event = eventMapper.toEntity(eventDto);
        event.setOrganizerId(organizerId);
        if (event.getStatus() == null) {
            event.setStatus(EventStatusEnum.DRAFT);
        }

        if (eventDto.getTicketTypes() != null) {
            for (var ttDto : eventDto.getTicketTypes()) {
                TicketType tt = eventMapper.toEntity(ttDto);
                event.addTicketType(tt);
            }
        }

        Event savedEvent = eventRepository.save(event);
        return eventMapper.toDto(savedEvent);
    }

    @Transactional(readOnly = true)
    public List<EventDTO> getOrganizerEvents(String organizerId) {
        List<Event> events = eventRepository.findByOrganizerId(organizerId);
        return eventMapper.toDtoList(events);
    }

    @Transactional(readOnly = true)
    public EventDTO getEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        return eventMapper.toDto(event);
    }

    public EventDTO updateEvent(UUID eventId, EventDTO eventDto, String organizerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (!event.getOrganizerId().equals(organizerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this event");
        }

        event.setName(eventDto.getName());
        event.setStartDateTime(eventDto.getStartDateTime());
        event.setEndDateTime(eventDto.getEndDateTime());
        event.setVenue(eventDto.getVenue());
        event.setSalesStartDate(eventDto.getSalesStartDate());
        event.setSalesEndDate(eventDto.getSalesEndDate());
        event.setStatus(eventDto.getStatus());

        event.getTicketTypes().clear();
        if (eventDto.getTicketTypes() != null) {
            for (var ttDto : eventDto.getTicketTypes()) {
                TicketType tt = eventMapper.toEntity(ttDto);
                event.addTicketType(tt);
            }
        }

        Event savedEvent = eventRepository.save(event);
        return eventMapper.toDto(savedEvent);
    }

    public void deleteEvent(UUID eventId, String organizerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (!event.getOrganizerId().equals(organizerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this event");
        }

        eventRepository.delete(event);
    }

    @Transactional(readOnly = true)
    public List<EventDTO> getPublishedEvents() {
        List<Event> events = eventRepository.findByStatus(EventStatusEnum.PUBLISHED);
        return eventMapper.toDtoList(events);
    }

    @Transactional(readOnly = true)
    public EventDTO getPublishedEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        if (event.getStatus() != EventStatusEnum.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Event is not published");
        }
        return eventMapper.toDto(event);
    }
}
