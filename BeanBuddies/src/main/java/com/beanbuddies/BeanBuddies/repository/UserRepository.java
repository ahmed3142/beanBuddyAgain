// src/main/java/com/beanbuddies/BeanBuddies/repository/UserRepository.java
package com.beanbuddies.BeanBuddies.repository;

import com.beanbuddies.BeanBuddies.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Find by the Supabase ID
    Optional<User> findBySupabaseId(String supabaseId);

    // Spring Security needs this
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsername(String username);
}