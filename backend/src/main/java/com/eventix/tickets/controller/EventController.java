package com.eventix.tickets.controller;

import com.eventix.tickets.dto.EventDTO;
import com.eventix.tickets.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping("/api/v1/events")
    @ResponseStatus(HttpStatus.CREATED)
    public EventDTO createEvent(@RequestBody EventDTO eventDto, @AuthenticationPrincipal Jwt jwt) {
        String organizerId = jwt.getSubject();
        return eventService.createEvent(eventDto, organizerId);
    }

    @GetMapping("/api/v1/events")
    public List<EventDTO> getOrganizerEvents(@AuthenticationPrincipal Jwt jwt) {
        String organizerId = jwt.getSubject();
        return eventService.getOrganizerEvents(organizerId);
    }

    @GetMapping("/api/v1/events/{eventId}")
    public EventDTO getEvent(@PathVariable UUID eventId) {
        return eventService.getEvent(eventId);
    }

    @PutMapping("/api/v1/events/{eventId}")
    public EventDTO updateEvent(
            @PathVariable UUID eventId,
            @RequestBody EventDTO eventDto,
            @AuthenticationPrincipal Jwt jwt) {
        String organizerId = jwt.getSubject();
        return eventService.updateEvent(eventId, eventDto, organizerId);
    }

    @DeleteMapping("/api/v1/events/{eventId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(@PathVariable UUID eventId, @AuthenticationPrincipal Jwt jwt) {
        String organizerId = jwt.getSubject();
        eventService.deleteEvent(eventId, organizerId);
    }

    @GetMapping("/api/v1/published-events")
    public List<EventDTO> getPublishedEvents() {
        return eventService.getPublishedEvents();
    }

    @GetMapping("/api/v1/published-events/{eventId}")
    public EventDTO getPublishedEvent(@PathVariable UUID eventId) {
        return eventService.getPublishedEvent(eventId);
    }
}
