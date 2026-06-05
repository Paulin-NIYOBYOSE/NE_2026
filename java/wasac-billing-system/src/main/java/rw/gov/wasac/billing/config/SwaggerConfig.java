package rw.gov.wasac.billing.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("WASAC Utility Billing System API")
                .version("1.0.0")
                .description("""
                    **Rwanda Water and Sanitation Corporation (WASAC/REG) — Automated Utility Billing System**

                    ---

                    ## Quick Start — How to Authenticate

                    1. Use the seeded admin account or register a new user:
                       - `POST /api/auth/login` → body: `{ "email": "admin@wasac.rw", "password": "Admin@1234" }`
                    2. Copy the `access_token` from the response.
                    3. Click the **Authorize** button (top-right), enter: `Bearer <your-token>` → click **Authorize**.

                    ---

                    ## Role-Based Access Summary

                    | Role | Responsibilities |
                    |------|-----------------|
                    | **ROLE_ADMIN** | Full access: users, customers, meters, tariffs, bill approval |
                    | **ROLE_OPERATOR** | Capture meter readings only |
                    | **ROLE_FINANCE** | Approve/reject bills, record payments |
                    | **ROLE_CUSTOMER** | View own bills, payments, and notifications |

                    ---

                    ## Typical Testing Flow

                    ```
                    1. Login as admin → get token
                    2. Create tariff (WATER/ELECTRICITY, FLAT or TIER_BASED)
                    3. Configure VAT (e.g. rate: 0.18 for 18%) and service charges
                    4. Create a customer → create a meter (assign to customer)
                    5. Create an OPERATOR user → login as operator → capture meter reading
                    6. Login as admin/finance → generate bill from reading → approve bill
                    7. Login as finance → record payment against bill reference
                    8. Login as customer (linked account) → view bills, payments, notifications
                    ```
                    """)
                .contact(new Contact().name("WASAC IT Department").email("billing@wasac.rw")))
            .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
            .components(new Components()
                .addSecuritySchemes("Bearer Authentication",
                    new SecurityScheme()
                        .name("Bearer Authentication")
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Enter your JWT token. Obtain it from POST /api/auth/login")))
            // Explicit tag ordering: tags appear in Swagger UI in this exact sequence
            .tags(List.of(
                new Tag().name("Authentication")
                    .description("Public endpoints — register and login to obtain a JWT token"),
                new Tag().name("User Management")
                    .description("[ADMIN] Create system users with specific roles, manage accounts, approve role upgrade requests"),
                new Tag().name("Customer Management")
                    .description("[ADMIN] Register and manage utility customers (National ID, contact details, status)"),
                new Tag().name("Meter Management")
                    .description("[ADMIN] Assign water and electricity meters to customers, activate/deactivate"),
                new Tag().name("Meter Readings")
                    .description("[OPERATOR] Capture monthly meter readings — enforces: current > previous, one reading per month, active meter only"),
                new Tag().name("Tariff Configuration")
                    .description("[ADMIN] Configure versioned consumption tariffs (FLAT rate or TIER_BASED) per meter type"),
                new Tag().name("Tax Configuration")
                    .description("[ADMIN] Configure VAT and other taxes applied to bills (e.g. rate: 0.18 = 18% VAT)"),
                new Tag().name("Service Charges")
                    .description("[ADMIN] Configure fixed service charges added to every bill per meter type"),
                new Tag().name("Penalties")
                    .description("[ADMIN] Configure late-payment penalty rules (FIXED amount or PERCENTAGE of bill)"),
                new Tag().name("Billing")
                    .description("[ADMIN/FINANCE] Generate bills from meter readings, approve or reject pending bills. [CUSTOMER] View own bills"),
                new Tag().name("Payments")
                    .description("[FINANCE] Record full or partial customer payments — auto-marks bill PAID when balance = 0. [CUSTOMER] View payment history"),
                new Tag().name("Notifications")
                    .description("[CUSTOMER] View billing and payment notifications auto-generated by PostgreSQL triggers. [ADMIN] View all notifications")
            ));
    }
}
