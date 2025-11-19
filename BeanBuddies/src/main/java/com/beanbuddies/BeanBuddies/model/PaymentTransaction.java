// src/main/java/com/beanbuddies/BeanBuddies/model/PaymentTransaction.java
package com.beanbuddies.BeanBuddies.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "payment_transaction")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Amader banano unique ID, e.g., "BB-COURSE-123"
    @Column(unique = true, nullable = false)
    private String transactionId; 

    // SSLCommerz theke paoya ID
    @Column(unique = true, nullable = true)
    private String sessionKey; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String status; // e.g., "PENDING", "PAID", "FAILED"

    public PaymentTransaction() {
        this.status = "PENDING";
    }
}