package com.beanbuddies.BeanBuddies.dto;

import com.beanbuddies.BeanBuddies.model.Comment;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CommentResponseDto {

    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private UserProfileDto author;

    // We can also show which course/lesson it belongs to
    private Long courseId;
    private Long lessonId;

    public CommentResponseDto(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
        this.author = new UserProfileDto(comment.getAuthor());

        if (comment.getCourse() != null) {
            this.courseId = comment.getCourse().getId();
        }
        if (comment.getLesson() != null) {
            this.lessonId = comment.getLesson().getId();
        }
    }
}