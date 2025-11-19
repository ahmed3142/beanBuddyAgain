// src/main/java/com/beanbuddies/BeanBuddies/service/EnrollmentService.java
package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.Enrollment;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.repository.CourseRepository;
import com.beanbuddies.BeanBuddies.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository; // We need this to find the course

    public Enrollment enrollStudent(Long courseId, User student) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        boolean alreadyEnrolled = enrollmentRepository.existsByStudentAndCourse(student, course);
        if (alreadyEnrolled) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You are already enrolled in this course");
        }

        Enrollment newEnrollment = new Enrollment();
        newEnrollment.setStudent(student);
        newEnrollment.setCourse(course);

        return enrollmentRepository.save(newEnrollment);
    }

    // --- EI NOTUN METHOD-TA ADD KORA HOYECHE ---
    /**
     * Checks if a user is enrolled in a specific course.
     */
    public boolean isUserEnrolled(Long courseId, User student) {
        // Shudhu check korbe, kono error throw korbe na
        Course course = new Course();
        course.setId(courseId); // Shudhu ID diye ekta temporary course object banano
        return enrollmentRepository.existsByStudentAndCourse(student, course);
    }
}