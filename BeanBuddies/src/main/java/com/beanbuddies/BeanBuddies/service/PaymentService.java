// src/main/java/com/beanbuddies/BeanBuddies/service/PaymentService.java
package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.config.PaymentConfig;
import com.beanbuddies.BeanBuddies.dto.PaymentInitiateRequest; // <-- NOTUN IMPORT
import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.PaymentTransaction;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.repository.CourseRepository;
import com.beanbuddies.BeanBuddies.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration; 
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentConfig config; // Ekhono dorkar store_id, ipn_url, etc. jonno
    private final CourseRepository courseRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final EnrollmentService enrollmentService;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * --- EI METHOD-TA UPDATE KORA HOYECHE ---
     * Ekhon PaymentInitiateRequest ney
     */
    @Transactional
    public String initiatePayment(Long courseId, User user, PaymentInitiateRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        // ... (Transaction ID ebong PENDING transaction save korar code same) ...
        String transactionId = "BB-" + courseId + "-" + UUID.randomUUID().toString().substring(0, 8);
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setTransactionId(transactionId);
        transaction.setStudent(user);
        transaction.setCourse(course);
        transaction.setAmount(course.getPrice());
        transaction.setStatus("PENDING");
        transactionRepository.save(transaction);

        // --- EIKHANE LOGIC UPDATE KORA HOYECHE ---
        // Notun, dynamic URL toiri kora hocche
        String successUrl = request.getFrontendBaseUrl() + config.getSuccessCallbackPath();
        String failUrl = request.getFrontendBaseUrl() + config.getFailCallbackPath();
        String cancelUrl = request.getFrontendBaseUrl() + config.getCancelCallbackPath();

        // Step 3: SSLCommerz-er jonno request body toiri kora
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("store_id", config.getStoreId());
        formData.add("store_passwd", config.getStorePassword());
        formData.add("total_amount", String.valueOf(course.getPrice()));
        formData.add("currency", "BDT");
        formData.add("tran_id", transactionId);
        
        // --- EIKHANE NOTUN URL-GULO USE KORA HOYECHE ---
        formData.add("success_url", successUrl);
        formData.add("fail_url", failUrl);
        formData.add("cancel_url", cancelUrl);
        
        // IPN URL ekhono backend-er config theke ashbe (ngrok URL)
        formData.add("ipn_url", config.getIpnUrl()); 

        // ... (baki User info, Course info, shipping_method code same) ...
        formData.add("cus_name", user.getUsername());
        formData.add("cus_email", user.getEmail());
        formData.add("cus_add1", "N/A");
        formData.add("cus_city", "N/A");
        formData.add("cus_country", "Bangladesh");
        formData.add("cus_phone", "N/A");
        formData.add("product_name", course.getTitle());
        formData.add("product_category", "Education");
        formData.add("product_profile", "digital-goods");
        formData.add("shipping_method", "NO");


        // Step 4: SSLCommerz Session API-te call kora
        try {
            // ... (baki code same)
            ResponseEntity<Map> response = restTemplate.postForEntity(config.getSessionApiUrl(), formData, Map.class);
            Map<String, String> responseBody = response.getBody();

            if ("SUCCESS".equals(responseBody.get("status"))) {
                transaction.setSessionKey(responseBody.get("sessionkey"));
                transactionRepository.save(transaction);
                
                return responseBody.get("redirectGatewayURL");
            } else {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Payment initiation failed: " + responseBody.get("failedreason"));
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Payment gateway error: " + e.getMessage());
        }
    }

    @Transactional
    public void validatePayment(Map<String, String> ipnData) {
        // ... (ei method-e kono change nai) ...
        String receivedTransactionId = ipnData.get("tran_id");
        String receivedStatus = ipnData.get("status");

        PaymentTransaction transaction = transactionRepository.findByTransactionId(receivedTransactionId)
                .orElse(null); 

        if (transaction == null) {
            System.err.println("IPN Error: Transaction not found with ID: " + receivedTransactionId);
            return;
        }

        if ("PAID".equals(transaction.getStatus())) {
            System.out.println("IPN Info: Transaction already processed: " + receivedTransactionId);
            return;
        }

        if (!"VALID".equals(receivedStatus)) {
            transaction.setStatus("FAILED");
            transactionRepository.save(transaction);
            System.err.println("IPN Info: Transaction failed with status: " + receivedStatus);
            return;
        }

        try {
            Double receivedAmount = Double.parseDouble(ipnData.get("amount"));
            
            if (transaction.getAmount().equals(receivedAmount)) {
                
                transaction.setStatus("PAID");
                transactionRepository.save(transaction);

                enrollmentService.enrollStudent(transaction.getCourse().getId(), transaction.getStudent());
                System.out.println("SUCCESS: Payment validated (IPN Only) and user enrolled for transaction: " + receivedTransactionId);

            } else {
                transaction.setStatus("FAILED");
                transactionRepository.save(transaction);
                System.err.println("IPN Error: Amount mismatch. DB Amount: " + transaction.getAmount() + ", IPN Amount: " + receivedAmount);
            }
        } catch (Exception e) {
            transaction.setStatus("FAILED");
            transactionRepository.save(transaction);
            System.err.println("IPN Error: Exception during IPN processing: " + e.getMessage());
        }
    }


    @Configuration
    static class RestTemplateConfig {
        @org.springframework.context.annotation.Bean
        public RestTemplate restTemplate() {
            return new RestTemplate();
        }
    }
}