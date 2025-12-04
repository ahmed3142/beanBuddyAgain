// src/main/java/com/beanbuddies/BeanBuddies/controller/UserController.java
package com.beanbuddies.BeanBuddies.controller;

import com.beanbuddies.BeanBuddies.dto.CourseResponseDto;
import com.beanbuddies.BeanBuddies.dto.DashboardDto; // <-- NOTUN IMPORT
import com.beanbuddies.BeanBuddies.dto.UserProfileDto;
import com.beanbuddies.BeanBuddies.dto.UserProfileUpdateRequest;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/me")
    public ResponseEntity<UserProfileDto> updateMyProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UserProfileUpdateRequest request
    ) {
        User updatedUser = userService.updateUserProfile(user, request);
        return ResponseEntity.ok(new UserProfileDto(updatedUser));
    }

    /**
     * --- EI METHOD-TA UPDATE KORA HOYECHE ---
     * Ekhon notun DashboardDto return korbe
     */
    @GetMapping("/me/dashboard")
    public ResponseEntity<DashboardDto> getMyDashboard( // <-- RETURN TYPE CHANGE
            @AuthenticationPrincipal User user
    ) {
        DashboardDto dashboard = userService.getDashboardCourses(user); // <-- LOGIC UPDATE
        return ResponseEntity.ok(dashboard);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyProfile(@AuthenticationPrincipal User user) {
        userService.deleteUser(user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public/{username}")
    public ResponseEntity<UserProfileDto> getPublicUserProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getPublicProfile(username));
    }
}