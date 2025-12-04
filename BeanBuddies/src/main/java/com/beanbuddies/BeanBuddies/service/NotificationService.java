package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.model.Notification;
import com.beanbuddies.BeanBuddies.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;

    @Transactional
    public void sendGlobalNotification(String message) {
        // 1. Save to DB
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setRecipientUsername(null); // Public
        notificationRepository.save(notification);

        // 2. Send via Socket
        messagingTemplate.convertAndSend("/topic/public-notifications", message);
    }

    @Transactional
    public void sendPrivateNotification(String username, String message) {
        // 1. Save to DB
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setRecipientUsername(username);
        notificationRepository.save(notification);

        // 2. Send via Socket
        messagingTemplate.convertAndSendToUser(username, "/queue/notifications", message);
    }

    @Transactional 
    public List<Notification> getUnreadNotifications(String username) {
        // 1. Database theke unread notification gulo ana
        List<Notification> privateNotifs = notificationRepository.findByRecipientUsernameAndIsReadFalseOrderByCreatedAtDesc(username);
        
        if (!privateNotifs.isEmpty()) {
            for (Notification n : privateNotifs) {
                n.setRead(true); // Mark as read
            }
            notificationRepository.saveAll(privateNotifs); // Save updated status to DB
        }
        
        return privateNotifs;
    }
}