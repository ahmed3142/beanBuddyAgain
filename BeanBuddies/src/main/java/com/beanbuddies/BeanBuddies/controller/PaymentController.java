// src/main/java/com/beanbuddies/BeanBuddies/controller/PaymentController.java
package com.beanbuddies.BeanBuddies.controller;

import com.beanbuddies.BeanBuddies.dto.PaymentInitiateRequest; // <-- NOTUN IMPORT
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * --- EI METHOD-TA UPDATE KORA HOYECHE ---
     * Ekhon @RequestBody ney
     */
    @PostMapping("/initiate/{courseId}")
    public ResponseEntity<Map<String, String>> initiatePayment(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user,
            @RequestBody PaymentInitiateRequest request // <-- NOTUN PARAMETER
    ) {
        // Notun parameter-ta service-e pass kora hocche
        String redirectUrl = paymentService.initiatePayment(courseId, user, request); 
        return ResponseEntity.ok(Map.of("redirectGatewayURL", redirectUrl));
    }

    /**
     * PUBLIC ENDPOINT
     * SSLCommerz ei endpoint-e IPN data pathabe (server-to-server).
     */
    @PostMapping(value = "/ipn", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Void> handleIpn(
            @RequestParam Map<String, String> ipnData
    ) {
        // ... (ei method-e kono change nai)
        System.out.println("Received IPN Data: " + ipnData);
        paymentService.validatePayment(ipnData);
        return ResponseEntity.ok().build();
    }

    // ... (baki /success, /fail, /cancel method-gulo same thakbe)
    @PostMapping("/success")
    public ResponseEntity<String> paymentSuccess() {
        return ResponseEntity.ok("Payment Success page (handled by frontend)");
    }

    @PostMapping("/fail")
    public ResponseEntity<String> paymentFail() {
        return ResponseEntity.ok("Payment Fail page (handled by frontend)");
    }

    @PostMapping("/cancel")
    public ResponseEntity<String> paymentCancel() {
        return ResponseEntity.ok("Payment Cancel page (handled by frontend)");
    }
}