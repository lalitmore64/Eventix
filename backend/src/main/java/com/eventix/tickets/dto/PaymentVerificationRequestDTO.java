package com.eventix.tickets.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVerificationRequestDTO {
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;
}
