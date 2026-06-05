package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateCustomerRequest {
    @NotBlank(message = "Full names are required")
    private String fullNames;

    @NotBlank(message = "National ID is required")
    private String nationalId;

    @NotBlank @Email
    private String email;

    @NotBlank
    private String phoneNumber;

    @NotBlank
    private String address;

    private Long userId;
}
