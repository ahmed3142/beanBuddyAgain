// src/main/java/com/beanbuddies/BeanBuddies/repository/PaymentTransactionRepository.java
package com.beanbuddies.BeanBuddies.repository;

import com.beanbuddies.BeanBuddies.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    
    Optional<PaymentTransaction> findByTransactionId(String transactionId);

}