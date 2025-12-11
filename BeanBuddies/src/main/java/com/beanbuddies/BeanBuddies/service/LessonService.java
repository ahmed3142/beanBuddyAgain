package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.dto.LessonCreateRequest;
import com.beanbuddies.BeanBuddies.dto.LessonResponseDto;
import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.Enrollment;
import com.beanbuddies.BeanBuddies.model.Lesson;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.repository.CourseRepository;
import com.beanbuddies.BeanBuddies.repository.EnrollmentRepository;
import com.beanbuddies.BeanBuddies.repository.LessonCompletionRepository;
import com.beanbuddies.BeanBuddies.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final LessonCompletionRepository completionRepository;

    // --- EXTRA INJECTIONS ---
    private final EnrollmentRepository enrollmentRepository;
    private final NotificationService notificationService;

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
        Lesson savedLesson = lessonRepository.save(newLesson);

        // --- TARGETED NOTIFICATION LOGIC ---
        String notificationMsg = "📚 New Lesson: '" + request.getTitle()
                + "' added to course '" + course.getTitle() + "'";
        String courseIdStr = String.valueOf(course.getId());

        // 1. Notify Instructor (confirmation only, no redirect needed)
        if (course.getInstructor() != null) {
            notificationService.sendInfoNotification(
                    course.getInstructor().getUsername(),
                    "✅ You added a new lesson: " + request.getTitle()
            );
        }

        // 2. Notify Enrolled Students -> COURSE notification with referenceId
        List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);
        for (Enrollment enrollment : enrollments) {
            User student = enrollment.getStudent();

            // Instructor ke skip koro (jodi she enroll thake)
            if (!student.getId().equals(course.getInstructor().getId())) {
                try {
                    notificationService.sendCourseNotification(
                            student.getUsername(),
                            notificationMsg,
                            courseIdStr           // 🔑 used for redirect on frontend
                    );
                } catch (Exception e) {
                    System.err.println("Failed to notify student " + student.getUsername() + ": " + e.getMessage());
                }
            }
        }

        return savedLesson;
    }

    @Transactional
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
