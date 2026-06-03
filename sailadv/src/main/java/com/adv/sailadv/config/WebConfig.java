package com.adv.sailadv.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // מגדיר שכל פנייה לכתובת /images/ תוביל לתיקייה בכונן C
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:C:/myFolder/");
    }
}