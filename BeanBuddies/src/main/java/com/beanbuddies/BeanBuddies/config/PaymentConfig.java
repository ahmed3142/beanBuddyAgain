// src/main/java/com/beanbuddies/BeanBuddies/config/PaymentConfig.java
package com.beanbuddies.BeanBuddies.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter 
public class PaymentConfig {

    @Value("${ssl.commerz.store-id}")
    private String storeId;

    @Value("${ssl.commerz.store-password}")
    private String storePassword;

    @Value("${ssl.commerz.api.session}")
    private String sessionApiUrl;

    @Value("${ssl.commerz.api.validation}")
    private String validationApiUrl;

    @Value("${app.base-url}") 
    private String appBaseUrl;

    @Value("${frontend.base-url}") 
    private String frontendBaseUrl;

    @Value("${ssl.commerz.callback.success}")
    private String successCallbackPath;

    @Value("${ssl.commerz.callback.fail}")
    private String failCallbackPath;

    @Value("${ssl.commerz.callback.cancel}")
    private String cancelCallbackPath;

    @Value("${ssl.commerz.callback.ipn}")
    private String ipnCallbackPath;

    // Helper methods to get full URLs
    public String getSuccessUrl() {
        return frontendBaseUrl + successCallbackPath;
    }

    public String getFailUrl() {
        return frontendBaseUrl + failCallbackPath;
    }

    public String getCancelUrl() {
        return frontendBaseUrl + cancelCallbackPath;
    }

    public String getIpnUrl() {
        return appBaseUrl + ipnCallbackPath;
    }
}