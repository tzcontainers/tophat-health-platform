package com.tophat.health;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class TophatHealthApplication {
    public static void main(String[] args) {
        SpringApplication.run(TophatHealthApplication.class, args);
    }
}
