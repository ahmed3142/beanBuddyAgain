package com.beanbuddies.BeanBuddies.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(nullable = true)
    private String recipientUsername; 

    @Column(nullable = false)
    private boolean isRead = false;

    // New Fields for Redirection
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(nullable = true)
    private String referenceId; // Can store CourseID, LessonID, or SenderUsername

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}