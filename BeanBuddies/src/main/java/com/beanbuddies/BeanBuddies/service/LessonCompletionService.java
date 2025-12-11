package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.model.Lesson;
import com.beanbuddies.BeanBuddies.model.LessonCompletion;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.repository.LessonCompletionRepository;
import com.beanbuddies.BeanBuddies.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict; // <-- IMPORT ADDED
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class LessonCompletionService {

    private final LessonCompletionRepository completionRepository;
    private final LessonRepository lessonRepository;

    @Transactional
    @CacheEvict(value = "dashboard", key = "#user.id") // <-- CACHE EVICT ADDED
    public void markLessonAsComplete(Long lessonId, User user) {
        // Check if already completed
        if (completionRepository.existsByStudentIdAndLessonIdNative(user.getId(), lessonId)) {
            return; // Already completed, do nothing
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));

        LessonCompletion completion = new LessonCompletion();
        completion.setStudent(user);
        completion.setLesson(lesson);

        completionRepository.save(completion);
    }
}