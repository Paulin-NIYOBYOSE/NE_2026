package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.UserStatus;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateCustomerRequest {
    @NotBlank
    private String fullNames;

    @NotBlank @Email
    private String email;

    @NotBlank
    private String phoneNumber;

    @NotBlank
    private String address;

    private UserStatus status;
}
