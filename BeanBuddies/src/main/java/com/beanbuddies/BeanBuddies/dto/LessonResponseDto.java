// src/main/java/com/beanbuddies/BeanBuddies/dto/LessonResponseDto.java
package com.beanbuddies.BeanBuddies.dto;

import com.beanbuddies.BeanBuddies.model.Lesson;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LessonResponseDto {

    private Long id;
    private String title;
    private String videoUrl;
    private String textContent;
    private Long courseId;
    private String courseTitle;
    private boolean isCompleted = false; // <-- NOTUN FIELD

    public LessonResponseDto(Lesson lesson) {
        this.id = lesson.getId();
        this.title = lesson.getTitle();
        this.videoUrl = lesson.getVideoUrl();
        this.textContent = lesson.getTextContent();
        this.courseId = lesson.getCourse().getId();
        this.courseTitle = lesson.getCourse().getTitle();
    }

    // Notun constructor jeta completion status nite pare
    public LessonResponseDto(Lesson lesson, boolean isCompleted) {
        this(lesson); // Ager constructor-take call kora hocche
        this.isCompleted = isCompleted;
    }
}