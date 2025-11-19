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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    // --- Get Comments ---

    public List<CommentResponseDto> getCommentsForCourse(Long courseId) {
        return commentRepository.findByCourseId(courseId).stream()
                .map(CommentResponseDto::new)
                .collect(Collectors.toList());
    }

    public List<CommentResponseDto> getCommentsForLesson(Long lessonId) {
        return commentRepository.findByLessonId(lessonId).stream()
                .map(CommentResponseDto::new)
                .collect(Collectors.toList());
    }

    // --- Create Comments ---

    public CommentResponseDto createCommentForCourse(Long courseId, User author, CommentCreateRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setAuthor(author);
        comment.setCourse(course);

        Comment savedComment = commentRepository.save(comment);
        return new CommentResponseDto(savedComment);
    }

    public CommentResponseDto createCommentForLesson(Long lessonId, User author, CommentCreateRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setAuthor(author);
        comment.setLesson(lesson);

        Comment savedComment = commentRepository.save(comment);
        return new CommentResponseDto(savedComment);
    }
}