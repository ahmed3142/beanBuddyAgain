package com.beanbuddies.BeanBuddies.controller;

import com.beanbuddies.BeanBuddies.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final CourseService courseService;

    /**
     * ADMIN-ONLY PROTECTED ENDPOINT
     * Deletes a course.
     * The @PreAuthorize annotation tells Spring Security to check the user's role
     * before even running this method.
     */
    @DeleteMapping("/courses/{courseId}")
    @PreAuthorize("hasRole('ADMIN')") // This is the security check
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build(); // Status 204
    }
}