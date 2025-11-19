// src/main/java/com/beanbuddies/BeanBuddies/dto/DashboardDto.java
package com.beanbuddies.BeanBuddies.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class DashboardDto {
    // Tomar toiri kora course
    private List<CourseResponseDto> createdCourses; 
    
    // Tomar enroll kora course
    private List<CourseResponseDto> enrolledCourses; 
}