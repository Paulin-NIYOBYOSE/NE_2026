package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateCustomerRequest {

    @NotBlank(message = "Full names are required")
    @Size(min = 3, max = 255, message = "Full names must be between 3 and 255 characters")
    private String fullNames;

    @NotBlank(message = "National ID is required")
    @Pattern(
        regexp = "^[0-9]{16}$",
        message = "National ID must be exactly 16 digits (e.g. 1199900012345678)"
    )
    private String nationalId;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid address")
    @Size(max = 255)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^(\\+250|250|0)?[7][0-9]{8}$",
        message = "Phone number must be a valid Rwanda number (e.g. +250788000000, 0788000000)"
    )
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 500, message = "Address must be between 5 and 500 characters")
    private String address;

    private Long userId;
}
