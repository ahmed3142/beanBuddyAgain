// src/main/java/com/beanbuddies/BeanBuddies/dto/CourseDetailDto.java
package com.beanbuddies.BeanBuddies.dto;

import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.Lesson; 
import com.beanbuddies.BeanBuddies.model.User; // <-- NOTUN IMPORT
import java.util.Comparator; 
import java.util.List;
import java.util.Set; // <-- NOTUN IMPORT
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseDetailDto {

    private Long id;
    private String title;
    private String description;
    private Double price;
    private UserProfileDto instructor;
    private List<LessonResponseDto> lessons; 

    // --- CONSTRUCTOR UPDATE KORA HOYECHE ---
    public CourseDetailDto(Course course, Set<Long> completedLessonIds) {
        this.id = course.getId();
        this.title = course.getTitle();
        this.description = course.getDescription();
        this.price = course.getPrice(); 
        
        if (course.getInstructor() != null) {
            this.instructor = new UserProfileDto(course.getInstructor());
        } else {
            this.instructor = null; 
        }

        // Lesson list toiri korar shomoy check kora hocche kon-ta completed
        this.lessons = course.getLessons().stream()
                .sorted(Comparator.comparing(Lesson::getId)) 
                .map(lesson -> new LessonResponseDto(
                    lesson, 
                    completedLessonIds.contains(lesson.getId()) // true/false pass kora hocche
                ))
                .collect(Collectors.toList());
    }
}