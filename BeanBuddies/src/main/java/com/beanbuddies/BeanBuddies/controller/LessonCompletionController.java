// src/main/java/com/beanbuddies/BeanBuddies/controller/LessonCompletionController.java
package com.beanbuddies.BeanBuddies.controller;

import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.service.LessonCompletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lessons")
@RequiredArgsConstructor
public class LessonCompletionController {

    private final LessonCompletionService completionService;

    /**
     * PROTECTED ENDPOINT
     * Marks a lesson as complete for the current user.
     */
    @PostMapping("/{lessonId}/complete")
    public ResponseEntity<Void> completeLesson(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal User user
    ) {
        completionService.markLessonAsComplete(lessonId, user);
        
        // --- EIKHANE FIX KORA HOYECHE ---
        // "ResponseEntity.ok().build()" (jeta 200 OK) er bodole
        // "ResponseEntity.noContent().build()" (jeta 204 No Content) deya hocche.
        return ResponseEntity.noContent().build();
    }
}