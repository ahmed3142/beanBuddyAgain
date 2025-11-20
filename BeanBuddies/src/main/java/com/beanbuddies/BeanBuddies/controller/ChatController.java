package com.beanbuddies.BeanBuddies.controller;

import com.beanbuddies.BeanBuddies.dto.ChatMessageDto;
import com.beanbuddies.BeanBuddies.model.ChatMessage;
import com.beanbuddies.BeanBuddies.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;

    // WebSocket Message Handling
    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessageDto chatMessageDto, Principal principal) {
        String senderUsername = principal.getName();
        chatMessageDto.setSenderId(senderUsername);

        // 1. Save to Database
        ChatMessage message = new ChatMessage();
        message.setSenderId(senderUsername);
        message.setRecipientId(chatMessageDto.getRecipientId());
        message.setContent(chatMessageDto.getContent());
        chatMessageRepository.save(message);

        // 2. Send to Recipient (Real-time)
        messagingTemplate.convertAndSendToUser(
                chatMessageDto.getRecipientId(),
                "/queue/messages",
                chatMessageDto
        );
        
        // 3. Send back to Sender (To show in their own UI immediately)
         messagingTemplate.convertAndSendToUser(
                senderUsername,
                "/queue/messages",
                chatMessageDto
        );
    }

    // History Loading Endpoint (REST API)
    @GetMapping("/api/v1/chat/history/{otherUser}")
    @ResponseBody
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @PathVariable String otherUser,
            Principal principal
    ) {
        List<ChatMessage> history = chatMessageRepository.findConversation(principal.getName(), otherUser);
        return ResponseEntity.ok(history);
    }
}