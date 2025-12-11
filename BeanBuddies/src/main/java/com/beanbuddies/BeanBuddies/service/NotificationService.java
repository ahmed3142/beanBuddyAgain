package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.model.Notification;
import com.beanbuddies.BeanBuddies.model.NotificationType;
import com.beanbuddies.BeanBuddies.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ---------- CREATE NOTIFICATIONS ----------

    public Notification sendPublicNotification(String message) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setRecipientUsername(null);
        notification.setType(NotificationType.GLOBAL);
        notification.setReferenceId(null);
        Notification saved = notificationRepository.save(notification);

        messagingTemplate.convertAndSend("/topic/public-notifications", saved);
        return saved;
    }

    // For course related stuff → redirect to /course/{referenceId}
    public Notification sendCourseNotification(String username, String message, String courseId) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setRecipientUsername(username);
        notification.setType(NotificationType.COURSE);
        notification.setReferenceId(courseId);
        Notification saved = notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(username, "/queue/notifications", saved);
        return saved;
    }

    // For pure chat messages → redirect to chat with {senderUsername}
    public Notification sendMessageNotification(String recipientUsername,
                                                String message,
                                                String senderUsername) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setRecipientUsername(recipientUsername);
        notification.setType(NotificationType.MESSAGE);
        notification.setReferenceId(senderUsername); // 🔥 very important
        Notification saved = notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(recipientUsername, "/queue/notifications", saved);
        return saved;
    }

    // Generic info notification (no redirect)
    public Notification sendInfoNotification(String username, String message) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setRecipientUsername(username);
        notification.setType(NotificationType.GLOBAL);
        notification.setReferenceId(null);
        Notification saved = notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(username, "/queue/notifications", saved);
        return saved;
    }

    // ---------- READ / FETCH ----------

    public List<Notification> getMyNotifications(String username) {
        // Gets personal + GLOBAL from DB
        List<Notification> all = new ArrayList<>(
                notificationRepository.findForUserWithPublic(username)
        );

        // Just to be extra safe on ordering
        all.sort(Comparator.comparing(Notification::getCreatedAt).reversed());
        return all;
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
