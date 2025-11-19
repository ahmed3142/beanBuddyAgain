package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.Enrollment;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.repository.CourseRepository;
import com.beanbuddies.BeanBuddies.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict; // <-- IMPORT ADDED
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    @Transactional
    @CacheEvict(value = "dashboard", key = "#student.id") // <-- CACHE EVICT ADDED
    public Enrollment enrollStudent(Long courseId, User student) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already enrolled in this course");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);

        return enrollmentRepository.save(enrollment);
    }

    public boolean isUserEnrolled(Long courseId, User student) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        return enrollmentRepository.existsByStudentAndCourse(student, course);
    }
}