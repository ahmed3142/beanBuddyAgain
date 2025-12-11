package com.beanbuddies.BeanBuddies.controller;

import com.beanbuddies.BeanBuddies.dto.*;
import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.Role;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.service.CommentService;
import com.beanbuddies.BeanBuddies.service.CourseService; 
// CourseRepository remove kora hoyeche logic clean korar jonno
import com.beanbuddies.BeanBuddies.repository.LessonCompletionRepository; 
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set; 

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CommentService commentService;
    // CourseRepository remove kora hoyeche, service use hobe
    private final LessonCompletionRepository completionRepository; 

    @GetMapping("/public/all")
    public ResponseEntity<List<CourseResponseDto>> getAllCourses() {
        // Eita ekhon cached method call korbe
        List<Course> courses = courseService.getAllCourses(); 
        
        List<CourseResponseDto> courseDtos = courses.stream()
                .map(CourseResponseDto::new) 
                .toList();
        return ResponseEntity.ok(courseDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDetailDto> getCourseById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user 
    ) {
        // --- UPDATE: Use Service instead of Repository for Caching ---
        Course course = courseService.getCourseById(id); // <-- CACHED CALL

        // Progress data user-specific, tai eita cache hobe na (DB hit hobe, but fast index use hobe)
        Set<Long> completedLessonIds = completionRepository.findCompletedLessonIdsByStudentAndCourse(user, course);
        
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