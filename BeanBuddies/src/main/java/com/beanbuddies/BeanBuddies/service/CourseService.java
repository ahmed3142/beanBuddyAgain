package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.dto.CourseCreateRequest;
import com.beanbuddies.BeanBuddies.dto.CourseResponseDto;
import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.Enrollment;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.repository.CourseRepository;
import com.beanbuddies.BeanBuddies.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    // --- NOTIFICATION SERVICE ---
    private final NotificationService notificationService;

    // @Cacheable(value = "public_courses")
    @Transactional(readOnly = true)
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "public_courses")
    public List<CourseResponseDto> getPublicCourses() {

        List<Course> courses = courseRepository.findAll();

        return courses.stream()
                .map(CourseResponseDto::new) // DTO created inside transaction
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "course_details", key = "#courseId")
    public Course getCourseById(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        course.getLessons().size();
        return course;
    }

    @Transactional
    @CacheEvict(value = { "public_courses", "instructor_courses" }, allEntries = true)
    public Course createCourse(CourseCreateRequest request, User instructor) {

        Course newCourse = new Course();
        newCourse.setTitle(request.getTitle());
        newCourse.setDescription(request.getDescription());
        newCourse.setInstructor(instructor);

        if (request.getPrice() != null) {
            newCourse.setPrice(request.getPrice());
        }

        Course savedCourse = courseRepository.save(newCourse);

        Enrollment instructorEnrollment = new Enrollment();
        instructorEnrollment.setStudent(instructor);
        instructorEnrollment.setCourse(savedCourse);

        enrollmentRepository.save(instructorEnrollment);

        // --- GLOBAL NOTIFICATION TRIGGER ---
        // Notun course create hole sobai notification pabe
        try {
            notificationService.sendPublicNotification(
                    "📢 New Course Alert: '" + newCourse.getTitle() + "' by " + instructor.getUsername());
        } catch (Exception e) {
            System.err.println("Global notification failed: " + e.getMessage());
        }

        return savedCourse;
    }

    @Transactional
    @CacheEvict(value = { "public_courses", "course_details", "instructor_courses" }, allEntries = true)
    public void deleteCourse(Long courseId) {
        courseRepository.deleteById(courseId);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "instructor_courses", key = "#username")
    public List<CourseResponseDto> getCoursesByInstructor(String username) {
        List<Course> courses = courseRepository.findByInstructorUsername(username);
        return courses.stream()
                .map(CourseResponseDto::new)
                .collect(Collectors.toList());
    }
}