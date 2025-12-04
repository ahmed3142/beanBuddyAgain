package com.beanbuddies.BeanBuddies.dto;

import com.beanbuddies.BeanBuddies.model.Enrollment;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class EnrollmentResponseDto {

    private Long id;
    private LocalDateTime enrolledAt;

    private UserProfileDto student;
    private CourseResponseDto course;

    public EnrollmentResponseDto(Enrollment enrollment) {
        this.id = enrollment.getId();
        this.enrolledAt = enrollment.getEnrolledAt();

        this.student = new UserProfileDto(enrollment.getStudent());
        this.course = new CourseResponseDto(enrollment.getCourse());
    }
}