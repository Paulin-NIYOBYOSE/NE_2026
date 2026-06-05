package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.RoleName;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateUserRequest {

    @NotBlank(message = "Full names are required")
    @Size(min = 3, max = 255, message = "Full names must be between 3 and 255 characters")
    private String fullNames;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid address (e.g. user@example.com)")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^(\\+250|250|0)?[7][0-9]{8}$",
        message = "Phone number must be a valid Rwanda number (e.g. +250788000000, 0788000000)"
    )
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be 6–100 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,}$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, and one digit"
    )
    private String password;

    @NotNull(message = "Role is required")
    private RoleName role;
}
