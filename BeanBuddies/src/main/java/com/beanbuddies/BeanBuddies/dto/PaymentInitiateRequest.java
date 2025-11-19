// src/main/java/com/beanbuddies/BeanBuddies/dto/PaymentInitiateRequest.java
package com.beanbuddies.BeanBuddies.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentInitiateRequest {
    // We only need the base URLs. The backend will add the /success or /fail paths.
    private String frontendBaseUrl; 
}