package com.virage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class VirageApplication {

    public static void main(String[] args) {
        SpringApplication.run(VirageApplication.class, args);
    }
}
