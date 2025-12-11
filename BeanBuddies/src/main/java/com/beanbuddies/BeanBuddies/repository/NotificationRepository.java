package com.beanbuddies.BeanBuddies.repository;

import com.beanbuddies.BeanBuddies.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Personal only 
    List<Notification> findByRecipientUsernameOrderByCreatedAtDesc(String recipientUsername);

    // personal + GLOBAL (recipient null)
    @Query("""
           SELECT n
           FROM Notification n
           WHERE n.recipientUsername = :username
              OR n.recipientUsername IS NULL
           ORDER BY n.createdAt DESC
           """)
    List<Notification> findForUserWithPublic(@Param("username") String username);

    // Used if you ever want only latest public
    List<Notification> findTop10ByRecipientUsernameIsNullOrderByCreatedAtDesc();
}
