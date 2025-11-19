// src/main/java/com/beanbuddies/BeanBuddies/repository/LessonCompletionRepository.java
package com.beanbuddies.BeanBuddies.repository;

import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.Lesson;
import com.beanbuddies.BeanBuddies.model.LessonCompletion;
import com.beanbuddies.BeanBuddies.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // <-- IMPORT KORTE HOBE

import java.util.Set;

public interface LessonCompletionRepository extends JpaRepository<LessonCompletion, Long> {
    @Query(value = "SELECT EXISTS(SELECT 1 FROM lesson_completion WHERE student_id = :studentId AND lesson_id = :lessonId)", 
           nativeQuery = true)
    boolean existsByStudentIdAndLessonIdNative(@Param("studentId") Long studentId, @Param("lessonId") Long lessonId);


    @Query("SELECT lc.lesson.id FROM LessonCompletion lc " +
           "WHERE lc.student = :student AND lc.lesson.course = :course")
    Set<Long> findCompletedLessonIdsByStudentAndCourse(User student, Course course);

    @Query("SELECT COUNT(lc) FROM LessonCompletion lc " +
           "WHERE lc.student = :student AND lc.lesson.course = :course")
    int countCompletedLessonsByStudentAndCourse(User student, Course course);
}