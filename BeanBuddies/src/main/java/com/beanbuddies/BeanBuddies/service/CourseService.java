// src/main/java/com/beanbuddies/BeanBuddies/service/CourseService.java
package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.dto.CourseCreateRequest;
import com.beanbuddies.BeanBuddies.dto.CourseResponseDto; // <-- NOTUN IMPORT
import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.Enrollment;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.repository.CourseRepository;
import com.beanbuddies.BeanBuddies.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors; // <-- NOTUN IMPORT

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Transactional
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

        return savedCourse;
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        courseRepository.deleteById(courseId);
    }
    
    // --- EI NOTUN METHOD-TA ADD KORA HOYECHE ---
    @Transactional(readOnly = true)
    public List<CourseResponseDto> getCoursesByInstructor(String username) {
        List<Course> courses = courseRepository.findByInstructorUsername(username);
        return courses.stream()
                .map(CourseResponseDto::new)
                .collect(Collectors.toList());
    }
}