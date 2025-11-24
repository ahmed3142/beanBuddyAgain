package com.beanbuddies.BeanBuddies;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching; // <-- IMPORT ADDED

@SpringBootApplication
@EnableCaching 
public class BeanBuddiesApplication {

	public static void main(String[] args) {
		SpringApplication.run(BeanBuddiesApplication.class, args);
	}

}