package com.eventix.tickets.domain.entity;

import com.eventix.tickets.domain.enums.TicketStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"ticketType", "qrCode"})
@EqualsAndHashCode(exclude = {"ticketType", "qrCode"})
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String purchaserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatusEnum status;

    @Column(nullable = false)
    private LocalDateTime createdDateTime;

    @Column(name = "payment_order_id")
    private String paymentOrderId;

    @Column(name = "payment_id")
    private String paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_type_id", nullable = false)
    private TicketType ticketType;

    @OneToOne(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private QrCode qrCode;

    public void setQrCode(QrCode qrCode) {
        this.qrCode = qrCode;
        if (qrCode != null) {
            qrCode.setTicket(this);
        }
    }
}
