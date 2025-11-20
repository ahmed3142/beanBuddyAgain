package com.beanbuddies.BeanBuddies.repository;

import com.beanbuddies.BeanBuddies.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Private (Unread) notifications
    List<Notification> findByRecipientUsernameAndIsReadFalseOrderByCreatedAtDesc(String recipientUsername);
    
    // Global (Recent) notifications - Last 10
    List<Notification> findTop10ByRecipientUsernameIsNullOrderByCreatedAtDesc();
}