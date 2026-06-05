package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.MeterType;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateMeterRequest {

    @NotBlank(message = "Meter number is required")
    @Size(min = 3, max = 100, message = "Meter number must be between 3 and 100 characters")
    @Pattern(
        regexp = "^[A-Z0-9\\-]{3,100}$",
        message = "Meter number must contain only uppercase letters, digits, and hyphens"
    )
    private String meterNumber;

    @NotNull(message = "Meter type is required (WATER or ELECTRICITY)")
    private MeterType meterType;

    @NotNull(message = "Installation date is required")
    @PastOrPresent(message = "Installation date cannot be in the future")
    private LocalDate installationDate;

    @NotNull(message = "Customer ID is required")
    @Positive(message = "Customer ID must be a positive number")
    private Long customerId;
}
