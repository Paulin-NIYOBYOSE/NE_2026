package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.UserStatus;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateCustomerRequest {

    @NotBlank(message = "Full names are required")
    @Size(min = 3, max = 255)
    private String fullNames;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^(\\+250|250|0)?[7][0-9]{8}$",
        message = "Phone number must be a valid Rwanda number (e.g. +250788000000)"
    )
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 500)
    private String address;

    private UserStatus status;
}
