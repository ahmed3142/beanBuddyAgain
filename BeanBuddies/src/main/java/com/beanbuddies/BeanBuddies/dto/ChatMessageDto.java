package com.beanbuddies.BeanBuddies.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDto {
    private String senderId;    // Backend set korbe (Security context theke)
    private String recipientId; // Frontend pathabe
    private String content;     // Frontend pathabe
}