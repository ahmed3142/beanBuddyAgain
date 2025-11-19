// src/main/java/com/beanbuddies/BeanBuddies/service/UserService.java
package com.beanbuddies.BeanBuddies.service;

import com.beanbuddies.BeanBuddies.dto.CourseResponseDto;
import com.beanbuddies.BeanBuddies.dto.DashboardDto; 
import com.beanbuddies.BeanBuddies.dto.UserProfileDto;
import com.beanbuddies.BeanBuddies.dto.UserProfileUpdateRequest;
import com.beanbuddies.BeanBuddies.model.Course; 
import com.beanbuddies.BeanBuddies.model.Enrollment;
import com.beanbuddies.BeanBuddies.model.Role;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.repository.CourseRepository; 
import com.beanbuddies.BeanBuddies.repository.EnrollmentRepository;
import com.beanbuddies.BeanBuddies.repository.LessonCompletionRepository; // <-- NOTUN IMPORT
import com.beanbuddies.BeanBuddies.repository.LessonRepository; // <-- NOTUN IMPORT
import com.beanbuddies.BeanBuddies.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository; 
    private final LessonCompletionRepository completionRepository; // <-- NOTUN FIELD
    private final LessonRepository lessonRepository; // <-- NOTUN FIELD

    // ... (findOrCreateUser, loadUserByUsername, updateUserProfile methods same ache) ...
    @Transactional
    public UserDetails findOrCreateUser(String supabaseId, String email) {
        return userRepository.findBySupabaseId(supabaseId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setSupabaseId(supabaseId);
                    newUser.setEmail(email);
                    newUser.setUsername(email); 
                    newUser.setPassword("DUMMY_PASSWORD");
                    if (userRepository.count() == 0) {
                        newUser.setRole(Role.ROLE_ADMIN);
                    } else {
                        newUser.setRole(Role.ROLE_STUDENT);
                    }
                    return userRepository.save(newUser);
                });
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    @Transactional
    public User updateUserProfile(User user, UserProfileUpdateRequest request) {
        User userToUpdate = userRepository.findById(user.getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            userToUpdate.setUsername(request.getUsername());
        }
        return userRepository.save(userToUpdate);
    }
    
    // --- EI METHOD-TA SHOMPURNO UPDATE KORA HOYECHE ---
    @Transactional(readOnly = true)
    public DashboardDto getDashboardCourses(User user) {
        // 1. User-er toiri kora shob course khuje ber korun
        List<Course> createdCourses = courseRepository.findByInstructor(user);

        // 2. User-er enroll kora shob enrollment khuje ber korun
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(user);

        // 3. Enrollment theke course-er list ber korun
        List<Course> enrolledCoursesList = enrollments.stream()
                .map(Enrollment::getCourse)
                // Filter kore nijer toiri kora course-gulo bad din
                .filter(course -> !course.getInstructor().getId().equals(user.getId()))
                .collect(Collectors.toList());

        // 4. DTO-te convert korun (Created courses)
        List<CourseResponseDto> createdCoursesDto = createdCourses.stream()
                .map(course -> {
                    // Nijer course-er progress dekhar dorkar nai
                    return new CourseResponseDto(course, 0); 
                })
                .collect(Collectors.toList());
        
        // 5. DTO-te convert korun (Enrolled courses)
        List<CourseResponseDto> enrolledCoursesDto = enrolledCoursesList.stream()
                .map(course -> {
                    // Prottek-ta course-er jonno progress count kora hocche
                    int completedCount = completionRepository.countCompletedLessonsByStudentAndCourse(user, course);
                    return new CourseResponseDto(course, completedCount);
                })
                .collect(Collectors.toList());

        // 6. Notun DashboardDto object-e data set kore return korun
        DashboardDto dashboard = new DashboardDto();
        dashboard.setCreatedCourses(createdCoursesDto);
        dashboard.setEnrolledCourses(enrolledCoursesDto);

        return dashboard;
    }

    @Transactional
    public void deleteUser(User user) {
        // ... (baki code same)
        User userToDelete = userRepository.findById(user.getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        userRepository.delete(userToDelete);
    }

    @Transactional(readOnly = true)
    public UserProfileDto getPublicProfile(String username) {
        // ... (baki code same)
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return new UserProfileDto(user);
    }
}