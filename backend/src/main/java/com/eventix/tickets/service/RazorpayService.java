package com.eventix.tickets.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

@Service
public class RazorpayService {

    @Value("${razorpay.key.id:rzp_test_mockKeyId}")
    private String keyId;

    @Value("${razorpay.key.secret:mockKeySecret}")
    private String keySecret;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        try {
            if (!"rzp_test_mockKeyId".equals(keyId) && !"mockKeySecret".equals(keySecret)) {
                this.razorpayClient = new RazorpayClient(keyId, keySecret);
            }
        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to initialize RazorpayClient", e);
        }
    }

    public String getKeyId() {
        return keyId;
    }

    public Order createOrder(double amount, String currency, String receipt) throws RazorpayException {
        if (this.razorpayClient == null) {
            // Mock mode Order creation
            JSONObject json = new JSONObject();
            json.put("id", "order_mock_" + System.currentTimeMillis());
            json.put("amount", (long) (amount * 100)); // amount in paise
            json.put("currency", currency);
            json.put("receipt", receipt);
            json.put("status", "created");
            return new Order(json);
        }

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (long) (amount * 100)); // amount in paise
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", receipt);

        return razorpayClient.orders.create(orderRequest);
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        if (this.razorpayClient == null) {
            // Mock signature passes for any mock order ID
            return orderId != null && orderId.startsWith("order_mock_");
        }

        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);
            return Utils.verifyPaymentSignature(attributes, keySecret);
        } catch (RazorpayException e) {
            return false;
        }
    }
}
