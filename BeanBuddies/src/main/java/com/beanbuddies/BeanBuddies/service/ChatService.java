package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.dto.ChatMessageDto;
import com.beanbuddies.BeanBuddies.model.ChatMessage;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.repository.ChatMessageRepository;
import com.beanbuddies.BeanBuddies.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void processAndSendMessage(ChatMessageDto chatMessageDto, String senderUsername) {
        // 1. Save to Database
        ChatMessage message = new ChatMessage();
        message.setSenderId(senderUsername);
        message.setRecipientId(chatMessageDto.getRecipientId());
        message.setContent(chatMessageDto.getContent());
        message.setRead(false);
        
        chatMessageRepository.save(message);

        // 2. Send to Recipient via WebSocket (Real-time)
        messagingTemplate.convertAndSendToUser(
                chatMessageDto.getRecipientId(),
                "/queue/messages",
                message
        );
        
        // 3. Send back to Sender (Sync across tabs)
        messagingTemplate.convertAndSendToUser(
                senderUsername,
                "/queue/messages",
                message
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getChatHistory(String currentUser, String otherUser, int page, int size) {
        Page<ChatMessage> pageData = chatMessageRepository.findConversation(
                currentUser, otherUser, PageRequest.of(page, size)
        );
        
        // Reverse list to show oldest messages first in the UI list logic
        List<ChatMessage> messages = new ArrayList<>(pageData.getContent());
        Collections.reverse(messages);

        return Map.of(
            "messages", messages,
            "totalPages", pageData.getTotalPages(),
            "currentPage", pageData.getNumber()
        );
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getInbox(String myUsername) {
        List<String> partners = chatMessageRepository.findChatPartners(myUsername);
        List<Map<String, Object>> inbox = new ArrayList<>();
        
        for (String partner : partners) {
            User user = userRepository.findByUsername(partner).orElse(null);
            if (user != null) {
                long unread = chatMessageRepository.countBySenderIdAndRecipientIdAndIsReadFalse(partner, myUsername);
                inbox.add(Map.of(
                    "username", partner,
                    "role", user.getRole(),
                    "unreadCount", unread
                ));
            }
        }
        return inbox;
    }

    @Transactional
    public void markAsRead(String senderId, String recipientId) {
        chatMessageRepository.markMessagesAsRead(senderId, recipientId);
    }
}