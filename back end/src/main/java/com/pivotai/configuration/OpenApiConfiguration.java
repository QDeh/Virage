package com.pivotai.configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfiguration {

    @Bean
    OpenAPI pivotAiOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Pivot AI API")
                .description("API d’orientation professionnelle et de reconversion")
                .version("v1"));
    }
}
