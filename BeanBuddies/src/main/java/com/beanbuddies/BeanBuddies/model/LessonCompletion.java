package com.beanbuddies.BeanBuddies.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "lesson_completion",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "lesson_id"})
    },
    indexes = {
        @Index(name = "idx_completion_student", columnList = "student_id"),
        @Index(name = "idx_completion_lesson", columnList = "lesson_id")
    }
)
public class LessonCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(nullable = false)
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        completedAt = LocalDateTime.now();
    }
}