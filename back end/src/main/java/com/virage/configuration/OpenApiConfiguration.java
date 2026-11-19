package com.virage.configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfiguration {

    @Bean
    OpenAPI virageOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Virage API")
                .description("API d’orientation professionnelle et de reconversion")
                .version("v1"));
    }
}
