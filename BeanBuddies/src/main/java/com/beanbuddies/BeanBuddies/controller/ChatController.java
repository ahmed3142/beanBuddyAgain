package com.beanbuddies.BeanBuddies.controller;

import com.beanbuddies.BeanBuddies.dto.ChatMessageDto;
import com.beanbuddies.BeanBuddies.model.ChatMessage;
import com.beanbuddies.BeanBuddies.service.ChatService; // Service added
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService; // Using Service

    // --- WebSocket Endpoint ---
    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessageDto chatMessageDto, Principal principal) {
        chatService.processAndSendMessage(chatMessageDto, principal.getName());
    }

    // --- REST API Endpoints ---
    
    @GetMapping("/api/v1/chat/history/{otherUser}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getChatHistory(
            @PathVariable String otherUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Principal principal
    ) {
        return ResponseEntity.ok(chatService.getChatHistory(principal.getName(), otherUser, page, size));
    }

    @GetMapping("/api/v1/chat/inbox")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getInbox(Principal principal) {
        return ResponseEntity.ok(chatService.getInbox(principal.getName()));
    }

    @PostMapping("/api/v1/chat/read/{otherUser}")
    @ResponseBody
    public ResponseEntity<Void> markAsRead(@PathVariable String otherUser, Principal principal) {
        // Mark messages FROM 'otherUser' TO 'me' as read
        chatService.markAsRead(otherUser, principal.getName());
        return ResponseEntity.ok().build();
    }
}