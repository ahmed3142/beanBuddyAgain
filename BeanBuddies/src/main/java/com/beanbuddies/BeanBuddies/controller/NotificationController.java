package com.beanbuddies.BeanBuddies.controller;

import com.beanbuddies.BeanBuddies.model.Notification;
import com.beanbuddies.BeanBuddies.model.User;
import com.beanbuddies.BeanBuddies.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getMyUnreadNotifications(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(user.getUsername()));
    }
}