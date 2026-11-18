package com.pivotai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PivotAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(PivotAiApplication.class, args);
    }
}
