package com.beanbuddies.BeanBuddies.repository;

import com.beanbuddies.BeanBuddies.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByCourseId(Long courseId);

    List<Comment> findByLessonId(Long lessonId);
}