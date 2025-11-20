package com.beanbuddies.BeanBuddies.controller;

import com.beanbuddies.BeanBuddies.service.NotificationService;
import com.beanbuddies.BeanBuddies.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
public class TestNotificationController {

    private final NotificationService notificationService;

    // 1. Test Public Notification
    @PostMapping("/public")
    public ResponseEntity<String> sendPublic() {
        notificationService.sendGlobalNotification("📢 This is a Public Test Notification!");
        return ResponseEntity.ok("Public notification sent");
    }

    // 2. Test Private Notification (Send to yourself)
    @PostMapping("/private")
    public ResponseEntity<String> sendPrivate(@AuthenticationPrincipal User user) {
        // Log user info to debug
        System.out.println("Targeting User: " + user.getUsername());
        
        notificationService.sendPrivateNotification(
            user.getUsername(), // Make sure this matches the WebSocket Principal
            "🔒 This is a Private Message for " + user.getUsername()
        );
        return ResponseEntity.ok("Private notification sent to " + user.getUsername());
    }
}