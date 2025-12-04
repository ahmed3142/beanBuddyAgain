package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.dto.CommentCreateRequest;
import com.beanbuddies.BeanBuddies.dto.CommentResponseDto;
import com.beanbuddies.BeanBuddies.model.Comment;
import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.Lesson;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.repository.CommentRepository;
import com.beanbuddies.BeanBuddies.repository.CourseRepository;
import com.beanbuddies.BeanBuddies.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    
    // --- NOTIFICATION SERVICE ---
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    @Cacheable(value = "course_comments", key = "#courseId")
    public List<CommentResponseDto> getCommentsForCourse(Long courseId) {
        List<Comment> comments = commentRepository.findByCourseId(courseId);
        return comments.stream()
                .map(CommentResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "course_comments", key = "#courseId")
    public CommentResponseDto createCommentForCourse(Long courseId, User author, CommentCreateRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setAuthor(author);
        comment.setCourse(course);

        Comment savedComment = commentRepository.save(comment);

        // --- NOTIFY INSTRUCTOR ---
        // Jodi comment-ti instructor na kore thake, tahole instructor ke notify koro
        if (course.getInstructor() != null && !course.getInstructor().getId().equals(author.getId())) {
            try {
                notificationService.sendPrivateNotification(
                    course.getInstructor().getUsername(),
                    "💬 New comment on your course '" + course.getTitle() + "': " + truncate(request.getContent())
                );
            } catch (Exception e) {
                System.err.println("Comment notification failed: " + e.getMessage());
            }
        }

        return new CommentResponseDto(savedComment);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "lesson_comments", key = "#lessonId")
    public List<CommentResponseDto> getCommentsForLesson(Long lessonId) {
        List<Comment> comments = commentRepository.findByLessonId(lessonId);
        return comments.stream()
                .map(CommentResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "lesson_comments", key = "#lessonId")
    public CommentResponseDto createCommentForLesson(Long lessonId, User author, CommentCreateRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setAuthor(author);
        comment.setLesson(lesson);

        Comment savedComment = commentRepository.save(comment);

        // --- NOTIFY INSTRUCTOR ---
        User instructor = lesson.getCourse().getInstructor();
        if (instructor != null && !instructor.getId().equals(author.getId())) {
            try {
                notificationService.sendPrivateNotification(
                    instructor.getUsername(),
                    "💬 New comment on lesson '" + lesson.getTitle() + "': " + truncate(request.getContent())
                );
            } catch (Exception e) {
                System.err.println("Lesson comment notification failed: " + e.getMessage());
            }
        }

        return new CommentResponseDto(savedComment);
    }

    // Helper method to shorten notification text
    private String truncate(String str) {
        if (str == null) return "";
        return str.length() > 30 ? str.substring(0, 27) + "..." : str;
    }
}