package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.UserStatus;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateUserRequest {
    @NotBlank(message = "Full names are required")
    private String fullNames;

    @NotBlank
    private String phoneNumber;

    private UserStatus status;
}
