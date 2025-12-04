package com.beanbuddies.BeanBuddies.dto; // <-- Correct package

import com.beanbuddies.BeanBuddies.model.Role; // <-- Correct import
import com.beanbuddies.BeanBuddies.model.User; // <-- Correct import
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileDto {

    private String email;
    private String username;
    private Role role;
    private String supabaseId;

    public UserProfileDto(User user) {
        this.email = user.getEmail();
        this.username = user.getUsername();
        this.role = user.getRole();
        this.supabaseId = user.getSupabaseId();
    }
}