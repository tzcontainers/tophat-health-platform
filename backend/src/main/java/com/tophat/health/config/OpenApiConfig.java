package com.tophat.health.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI api() {
        return new OpenAPI().info(new Info().title("TopHat Health Care API")
                                            .description("Healthcare recruitment and staffing starter API")
                                            .version("1.0.0")
                                            .contact(new Contact().name("TopHat Health Care"))
                                            .license(new License().name("Internal Starter Project")));
    }
}
