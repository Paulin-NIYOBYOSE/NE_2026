package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.RoleName;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateUserRequest {
    @NotBlank(message = "Full names are required")
    private String fullNames;

    @NotBlank @Email
    private String email;

    @NotBlank
    private String phoneNumber;

    @NotBlank @Size(min = 6)
    private String password;

    @NotNull(message = "Role is required")
    private RoleName role;
}
