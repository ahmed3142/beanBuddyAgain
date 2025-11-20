package com.beanbuddies.BeanBuddies.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDto {
    private String senderId;   // Username or Email
    private String recipientId; // Username or Email (Instructor)
    private String content;
    private String type; // "CHAT", "JOIN", "LEAVE"
}