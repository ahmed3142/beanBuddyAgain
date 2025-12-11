package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.Enrollment;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.repository.CourseRepository;
import com.beanbuddies.BeanBuddies.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    private final NotificationService notificationService;

    @Transactional
    @CacheEvict(value = "dashboard", key = "#student.id")
    public Enrollment enrollStudent(Long courseId, User student) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already enrolled in this course");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        // COURSE notification with redirect to this course
        try {
            notificationService.sendCourseNotification(
                    student.getUsername(),
                    "🎉 Congratulations! You have successfully enrolled in " + course.getTitle(),
                    String.valueOf(course.getId())
            );
        } catch (Exception e) {
            System.err.println("Notification failed: " + e.getMessage());
        }

        return savedEnrollment;
    }

    public boolean isUserEnrolled(Long courseId, User student) {
        Course course = new Course();
        course.setId(courseId);
        return enrollmentRepository.existsByStudentAndCourse(student, course);
    }
}
