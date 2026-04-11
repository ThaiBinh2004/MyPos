package com.forher.erp_backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Tài liệu - Hệ thống ERP FORHER")
                        .version("1.0.0")
                        .description("Tài liệu tích hợp các API cho Phân hệ Nhân sự và Bán hàng của doanh nghiệp FORHER.")
                        .contact(new Contact()
                                .name("Nhóm 2 - Dev Team")
                                .email("contact@forher.com")));
    }
}