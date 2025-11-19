package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.dto.LessonCreateRequest;
import com.beanbuddies.BeanBuddies.dto.LessonResponseDto; 
import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.Lesson;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.repository.CourseRepository;
import com.beanbuddies.BeanBuddies.repository.LessonCompletionRepository; 
import com.beanbuddies.BeanBuddies.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict; // <-- IMPORT
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority; 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final LessonCompletionRepository completionRepository; 

    @Transactional(readOnly = true)
    public LessonResponseDto getLessonDetails(Long lessonId, User currentUser) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));

        boolean isAdmin = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));

        boolean isInstructor = lesson.getCourse().getInstructor().getId().equals(currentUser.getId());

        boolean isEnrolled = lessonRepository.isUserEnrolledInLessonCourse(lessonId, currentUser.getId());

        if (!isAdmin && !isInstructor && !isEnrolled) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not enrolled in this course");
        }

        boolean isCompleted = completionRepository.existsByStudentIdAndLessonIdNative(currentUser.getId(), lesson.getId());

        return new LessonResponseDto(lesson, isCompleted);
    }

    @Transactional
    // Lesson add korle 'course_details' cache clear kora hocche
    @CacheEvict(value = "course_details", key = "#courseId") 
    public Lesson addLessonToCourse(LessonCreateRequest request, Long courseId, User currentUser) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!course.getInstructor().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not the instructor of this course");
        }

        Lesson newLesson = new Lesson();
        newLesson.setTitle(request.getTitle());
        newLesson.setVideoUrl(request.getVideoUrl());
        newLesson.setTextContent(request.getTextContent());

        course.addLesson(newLesson);

        return lessonRepository.save(newLesson);
    }

    @Transactional
    // Lesson delete korle sob cache clear (safety er jonno)
    @CacheEvict(value = "course_details", allEntries = true) 
    public void deleteLesson(Long lessonId, User currentUser) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));

        boolean isInstructor = lesson.getCourse().getInstructor().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));

        if (!isInstructor && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this lesson");
        }
        
        lessonRepository.delete(lesson);
    }
}