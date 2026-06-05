package rw.gov.wasac.billing.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("WASAC Utility Billing System API")
                .version("1.0.0")
                .description("""
                    **Rwanda Water and Sanitation Corporation (WASAC) — Automated Utility Billing System**
                    
                    ## How to Authenticate
                    1. Register via `POST /api/auth/register` or use the seeded admin: `admin@wasac.rw` / `Admin@1234`
                    2. Login via `POST /api/auth/login` to get a JWT token
                    3. Click **Authorize** above, enter: `Bearer <your-token>`
                    
                    ## Roles
                    - **ROLE_ADMIN**: Full system access (seeded automatically)
                    - **ROLE_OPERATOR**: Capture meter readings
                    - **ROLE_FINANCE**: Approve bills, record payments
                    - **ROLE_CUSTOMER**: View bills, payment history, notifications
                    """)
                .contact(new Contact().name("WASAC IT Team").email("billing@wasac.rw")))
            .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
            .components(new Components()
                .addSecuritySchemes("Bearer Authentication",
                    new SecurityScheme()
                        .name("Bearer Authentication")
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Paste your JWT token obtained from /api/auth/login")));
    }
}
