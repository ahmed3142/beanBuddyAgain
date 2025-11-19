// src/main/java/com/beanbuddies/BeanBuddies/controller/CourseController.java
package com.beanbuddies.BeanBuddies.controller;

import com.beanbuddies.BeanBuddies.dto.*;
import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.Role;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.service.CommentService;
import com.beanbuddies.BeanBuddies.service.CourseService; 
import com.beanbuddies.BeanBuddies.repository.CourseRepository; 
import com.beanbuddies.BeanBuddies.repository.LessonCompletionRepository; // <-- NOTUN IMPORT
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set; // <-- NOTUN IMPORT

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CommentService commentService;
    private final CourseRepository courseRepository; 
    private final LessonCompletionRepository completionRepository; // <-- NOTUN FIELD

    @GetMapping("/public/all")
    public ResponseEntity<List<CourseResponseDto>> getAllCourses() {
        List<Course> courses = courseService.getAllCourses();
        List<CourseResponseDto> courseDtos = courses.stream()
                .map(CourseResponseDto::new) // Eita ekhon progress dekhabe na
                .toList();
        return ResponseEntity.ok(courseDtos);
    }

    /**
     * --- EI ENDPOINT-TA PROTECTED KORA HOYECHE ---
     * Ekhon ei endpoint-ta user-er completed lesson-gulo return korbe
     */
    @GetMapping("/{id}") // "/public" path theke remove kora hoyeche
    public ResponseEntity<CourseDetailDto> getCourseById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user // <-- User object neya hocche
    ) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        // User-er completed lesson ID-gulo ber kora
        Set<Long> completedLessonIds = completionRepository.findCompletedLessonIdsByStudentAndCourse(user, course);
        
        // Notun constructor call kora hocche
        return ResponseEntity.ok(new CourseDetailDto(course, completedLessonIds));
    }
    
    @GetMapping("/public/by/{username}")
    public ResponseEntity<List<CourseResponseDto>> getCoursesByInstructor(@PathVariable String username) {
        List<CourseResponseDto> courses = courseService.getCoursesByInstructor(username);
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/create")
    public ResponseEntity<CourseResponseDto> createCourse(
            @RequestBody CourseCreateRequest request,
            @AuthenticationPrincipal User user
    ) {
        if (user.getRole() != Role.ROLE_INSTRUCTOR && user.getRole() != Role.ROLE_ADMIN) { 
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only instructors or admins can create courses.");
        }
        Course newCourse = courseService.createCourse(request, user);
        return new ResponseEntity<>(new CourseResponseDto(newCourse), HttpStatus.CREATED);
    }

    @GetMapping("/my-profile")
    public ResponseEntity<UserProfileDto> getMyProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new UserProfileDto(user));
    }

    @GetMapping("/{courseId}/comments")
    public ResponseEntity<List<CommentResponseDto>> getCommentsForCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(commentService.getCommentsForCourse(courseId));
    }

    @PostMapping("/{courseId}/comments")
    public ResponseEntity<CommentResponseDto> createCommentForCourse(
            @PathVariable Long courseId,
            @RequestBody CommentCreateRequest request,
            @AuthenticationPrincipal User user
    ) {
        CommentResponseDto newComment = commentService.createCommentForCourse(courseId, user, request);
        return new ResponseEntity<>(newComment, HttpStatus.CREATED);
    }
}