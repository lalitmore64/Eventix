package com.eventix.tickets.repository;

import com.eventix.tickets.domain.entity.Event;
import com.eventix.tickets.domain.enums.EventStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
    List<Event> findByOrganizerId(String organizerId);
    List<Event> findByStatus(EventStatusEnum status);
}
