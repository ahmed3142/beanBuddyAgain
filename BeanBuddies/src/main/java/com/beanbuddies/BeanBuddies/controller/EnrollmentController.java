// src/main/java/com/beanbuddies/BeanBuddies/controller/EnrollmentController.java
package com.beanbuddies.BeanBuddies.controller;

import com.beanbuddies.BeanBuddies.dto.EnrollmentResponseDto; 
import com.beanbuddies.BeanBuddies.model.Enrollment;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map; // <-- NOTUN IMPORT

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<EnrollmentResponseDto> enrollInCourse(
                                                                 @PathVariable Long courseId,
                                                                 @AuthenticationPrincipal User student
    ) {
        Enrollment enrollment = enrollmentService.enrollStudent(courseId, student);
        return new ResponseEntity<>(new EnrollmentResponseDto(enrollment), HttpStatus.CREATED);
    }

    // --- EI NOTUN ENDPOINT-TA ADD KORA HOYECHE ---
    /**
     * PROTECTED ENDPOINT
     * Checks if the current user is enrolled in the given course.
     */
    @GetMapping("/is-enrolled/{courseId}")
    public ResponseEntity<Map<String, Boolean>> checkEnrollment(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User student
    ) {
        boolean isEnrolled = enrollmentService.isUserEnrolled(courseId, student);
        // Frontend-e shohoje use korar jonno ekta simple JSON object return kora hocche
        return ResponseEntity.ok(Map.of("isEnrolled", isEnrolled));
    }
}