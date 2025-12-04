package com.beanbuddies.BeanBuddies.repository;

import com.beanbuddies.BeanBuddies.model.Course;
import com.beanbuddies.BeanBuddies.model.Enrollment;
import com.beanbuddies.BeanBuddies.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    boolean existsByStudentAndCourse(User student, Course course);

    List<Enrollment> findByStudent(User student);

    List<Enrollment> findByCourse(Course course);
}