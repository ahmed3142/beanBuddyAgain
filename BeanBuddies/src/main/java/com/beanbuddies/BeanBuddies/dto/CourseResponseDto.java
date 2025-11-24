// src/main/java/com/beanbuddies/BeanBuddies/dto/CourseResponseDto.java
package com.beanbuddies.BeanBuddies.dto;

import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.User; // <-- NOTUN IMPORT
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseResponseDto {

    private Long id;
    private String title;
    private String description;
    private Double price; 
    private String instructorName; 
    
    // --- NOTUN FIELD ---
    private int totalLessons;
    private int completedLessons;

    // Public course list-er jonno ager constructor
    public CourseResponseDto(Course course) {
        this.id = course.getId();
        this.title = course.getTitle();
        this.description = course.getDescription();
        this.price = course.getPrice(); 
        
        if (course.getInstructor() != null) {
            this.instructorName = course.getInstructor().getUsername(); 
        } else {
            this.instructorName = "Unknown";
        }
        
        this.totalLessons = course.getLessons().size(); // Shudhu total lesson dekhabe
        this.completedLessons = 0; // Public page-e progress 0
    }
    
    // --- NOTUN CONSTRUCTOR ---
    // Dashboard-er jonno ei constructor-ta user-er progress-shoho data dibe
    public CourseResponseDto(Course course, int completedLessonsCount) {
        this(course); // Ager constructor-take call kora
        this.completedLessons = completedLessonsCount;
    }
}