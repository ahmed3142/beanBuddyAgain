// src/main/java/com/beanbuddies/BeanBuddies/repository/LessonRepository.java
package com.beanbuddies.BeanBuddies.repository;

import com.beanbuddies.BeanBuddies.model.Course; // <-- NOTUN IMPORT
import com.beanbuddies.BeanBuddies.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; 
import java.util.Optional; 

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN TRUE ELSE FALSE END " +
           "FROM Enrollment e " +
           "WHERE e.course.id = (SELECT l.course.id FROM Lesson l WHERE l.id = :lessonId) " +
           "AND e.student.id = :userId")
    boolean isUserEnrolledInLessonCourse(Long lessonId, Long userId);
    
    // --- EI NOTUN METHOD-TA ADD KORUN ---
    int countByCourse(Course course);
}