// src/main/java/com/beanbuddies/BeanBuddies/dto/CourseCreateRequest.java
package com.beanbuddies.BeanBuddies.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseCreateRequest {
    private String title;
    private String description;
    private Double price; 
}