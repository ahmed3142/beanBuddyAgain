// src/main/java/com/beanbuddies/BeanBuddies/repository/CourseRepository.java
package com.beanbuddies.BeanBuddies.repository;

import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.User; 
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; 

public interface CourseRepository extends JpaRepository<Course, Long> {
    
    
    List<Course> findByInstructor(User instructor);
    
    List<Course> findByInstructorUsername(String username);
}