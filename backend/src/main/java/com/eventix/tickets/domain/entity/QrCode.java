package com.eventix.tickets.domain.entity;

import com.eventix.tickets.domain.enums.QrCodeStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "qr_codes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "ticket")
@EqualsAndHashCode(exclude = "ticket")
public class QrCode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Column(nullable = false)
    private LocalDateTime generatedTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QrCodeStatusEnum status;
}
