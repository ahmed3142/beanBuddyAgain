package com.beanbuddies.BeanBuddies.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LessonCreateRequest {
    private String title;
    private String videoUrl;
    private String textContent;
}