package com.beanbuddies.BeanBuddies.repository;

import com.beanbuddies.BeanBuddies.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 1. Specific conversation with Pagination (Facebook style: latest first)
    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.senderId = :user1 AND m.recipientId = :user2) OR " +
           "(m.senderId = :user2 AND m.recipientId = :user1) " +
           "ORDER BY m.timestamp DESC") // Latest message first for pagination
    Page<ChatMessage> findConversation(@Param("user1") String user1, @Param("user2") String user2, Pageable pageable);

    // 2. Find distinct users I have chatted with (For Inbox)
    @Query("SELECT DISTINCT " +
           "CASE WHEN m.senderId = :myUsername THEN m.recipientId ELSE m.senderId END " +
           "FROM ChatMessage m " +
           "WHERE m.senderId = :myUsername OR m.recipientId = :myUsername")
    List<String> findChatPartners(@Param("myUsername") String myUsername);
    
    // 3. Count unread messages from a specific user
    long countBySenderIdAndRecipientIdAndIsReadFalse(String senderId, String recipientId);

    // 4. Mark messages as read
    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.senderId = :senderId AND m.recipientId = :recipientId")
    void markMessagesAsRead(@Param("senderId") String senderId, @Param("recipientId") String recipientId);
}