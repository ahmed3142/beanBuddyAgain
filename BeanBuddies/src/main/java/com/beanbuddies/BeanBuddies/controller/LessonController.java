// src/main/java/com/beanbuddies/BeanBuddies/controller/LessonController.java
package com.beanbuddies.BeanBuddies.controller;

import com.beanbuddies.BeanBuddies.dto.CommentCreateRequest;
import com.beanbuddies.BeanBuddies.dto.CommentResponseDto;
import com.beanbuddies.BeanBuddies.dto.LessonCreateRequest;
import com.beanbuddies.BeanBuddies.dto.LessonResponseDto;
import com.beanbuddies.BeanBuddies.model.Lesson;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.service.CommentService;
import com.beanbuddies.BeanBuddies.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;
    private final CommentService commentService;

    /**
     * --- EI ENDPOINT-TA UPDATE KORA HOYECHE ---
     * Ekhon service theke shorashori DTO ashe
     */
    @GetMapping("/{lessonId}")
    public ResponseEntity<LessonResponseDto> getLessonDetails(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal User user
    ) {
        LessonResponseDto lessonDto = lessonService.getLessonDetails(lessonId, user);
        return ResponseEntity.ok(lessonDto);
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<LessonResponseDto> addLesson(
            @PathVariable Long courseId,
            @RequestBody LessonCreateRequest request,
            @AuthenticationPrincipal User user
    ) {
        Lesson newLesson = lessonService.addLessonToCourse(request, courseId, user);
        return new ResponseEntity<>(new LessonResponseDto(newLesson), HttpStatus.CREATED);
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> deleteLesson(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal User user
    ) {
        lessonService.deleteLesson(lessonId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{lessonId}/comments")
    public ResponseEntity<List<CommentResponseDto>> getCommentsForLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(commentService.getCommentsForLesson(lessonId));
    }

    @PostMapping("/{lessonId}/comments")
    public ResponseEntity<CommentResponseDto> createCommentForLesson(
            @PathVariable Long lessonId,
            @RequestBody CommentCreateRequest request,
            @AuthenticationPrincipal User user
    ) {
        CommentResponseDto newComment = commentService.createCommentForLesson(lessonId, user, request);
        return new ResponseEntity<>(newComment, HttpStatus.CREATED);
    }
}