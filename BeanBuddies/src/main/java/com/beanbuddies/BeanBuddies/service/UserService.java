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
import com.beanbuddies.BeanBuddies.repository.LessonCompletionRepository; 
import com.beanbuddies.BeanBuddies.repository.LessonRepository; 
import com.beanbuddies.BeanBuddies.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict; // <-- IMPORT
import org.springframework.cache.annotation.Cacheable; // <-- IMPORT
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
    private final LessonCompletionRepository completionRepository; 
    private final LessonRepository lessonRepository; 

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
    // Profile update hole cache clear kore dibo
    @CacheEvict(value = "public_profiles", allEntries = true) 
    public User updateUserProfile(User user, UserProfileUpdateRequest request) {
        User userToUpdate = userRepository.findById(user.getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            userToUpdate.setUsername(request.getUsername());
        }
        return userRepository.save(userToUpdate);
    }
    
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard", key = "#user.id")
    public DashboardDto getDashboardCourses(User user) {
        List<Course> createdCourses = courseRepository.findByInstructor(user);
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(user);

        List<Course> enrolledCoursesList = enrollments.stream()
                .map(Enrollment::getCourse)
                .filter(course -> !course.getInstructor().getId().equals(user.getId()))
                .collect(Collectors.toList());

        List<CourseResponseDto> createdCoursesDto = createdCourses.stream()
                .map(course -> new CourseResponseDto(course, 0))
                .collect(Collectors.toList());
        
        List<CourseResponseDto> enrolledCoursesDto = enrolledCoursesList.stream()
                .map(course -> {
                    int completedCount = completionRepository.countCompletedLessonsByStudentAndCourse(user, course);
                    return new CourseResponseDto(course, completedCount);
                })
                .collect(Collectors.toList());

        DashboardDto dashboard = new DashboardDto();
        dashboard.setCreatedCourses(createdCoursesDto);
        dashboard.setEnrolledCourses(enrolledCoursesDto);

        return dashboard;
    }

    @Transactional
    @CacheEvict(value = "public_profiles", allEntries = true)
    public void deleteUser(User user) {
        User userToDelete = userRepository.findById(user.getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        userRepository.delete(userToDelete);
    }

    // --- PUBLIC PROFILE CACHE ---
    @Transactional(readOnly = true)
    @Cacheable(value = "public_profiles", key = "#username") // Cache added by username
    public UserProfileDto getPublicProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return new UserProfileDto(user);
    }
}