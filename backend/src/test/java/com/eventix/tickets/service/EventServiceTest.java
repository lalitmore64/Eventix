package com.eventix.tickets.service;

import com.eventix.tickets.domain.entity.Event;
import com.eventix.tickets.domain.enums.EventStatusEnum;
import com.eventix.tickets.dto.EventDTO;
import com.eventix.tickets.dto.TicketTypeDTO;
import com.eventix.tickets.repository.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class EventServiceTest {

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepository;

    @BeforeEach
    void setUp() {
        eventRepository.deleteAll();
    }

    @Test
    void testCreateEventAndFetch() {
        String organizerId = "user-123";
        EventDTO eventDto = EventDTO.builder()
                .name("Rock Concert")
                .venue("Madison Square Garden")
                .startDateTime(LocalDateTime.now().plusDays(5))
                .endDateTime(LocalDateTime.now().plusDays(5).plusHours(3))
                .status(EventStatusEnum.DRAFT)
                .ticketTypes(List.of(
                        TicketTypeDTO.builder().name("VIP").price(150.0).totalAvailable(50).build(),
                        TicketTypeDTO.builder().name("General").price(50.0).totalAvailable(500).build()
                ))
                .build();

        EventDTO created = eventService.createEvent(eventDto, organizerId);

        assertThat(created.getId()).isNotNull();
        assertThat(created.getName()).isEqualTo("Rock Concert");
        assertThat(created.getOrganizerId()).isEqualTo(organizerId);
        assertThat(created.getTicketTypes()).hasSize(2);
        assertThat(created.getTicketTypes().get(0).getId()).isNotNull();

        List<EventDTO> organizerEvents = eventService.getOrganizerEvents(organizerId);
        assertThat(organizerEvents).hasSize(1);
        assertThat(organizerEvents.get(0).getName()).isEqualTo("Rock Concert");
    }
}
