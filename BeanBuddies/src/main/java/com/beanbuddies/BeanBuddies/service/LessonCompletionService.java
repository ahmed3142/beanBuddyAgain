// src/main/java/com/beanbuddies/BeanBuddies/service/LessonCompletionService.java
package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.model.Lesson;
import com.beanbuddies.BeanBuddies.model.LessonCompletion;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.repository.LessonCompletionRepository;
import com.beanbuddies.BeanBuddies.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class LessonCompletionService {

    private final LessonRepository lessonRepository;
    private final EnrollmentService enrollmentService;
    private final LessonCompletionRepository completionRepository;

    @Transactional
    public void markLessonAsComplete(Long lessonId, User user) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));

        boolean isEnrolled = enrollmentService.isUserEnrolled(lesson.getCourse().getId(), user);
        if (!isEnrolled) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You must be enrolled to complete this lesson");
        }

        // --- EIKHANE UPDATE KORA HOYECHE ---
        // Ekhon notun "Native Query" method-ta call kora hocche
        boolean alreadyCompleted = completionRepository.existsByStudentIdAndLessonIdNative(user.getId(), lesson.getId());
        if (alreadyCompleted) {
            return; 
        }

        LessonCompletion completion = new LessonCompletion();
        completion.setStudent(user);
        completion.setLesson(lesson);
        completionRepository.save(completion);
    }
}