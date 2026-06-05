package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateMeterReadingRequest {

    @NotNull(message = "Meter ID is required")
    @Positive(message = "Meter ID must be a positive number")
    private Long meterId;

    @NotNull(message = "Previous reading is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Previous reading must be 0 or greater")
    @Digits(integer = 7, fraction = 3, message = "Previous reading: max 7 integer digits, 3 decimal places")
    private BigDecimal previousReading;

    @NotNull(message = "Current reading is required")
    @DecimalMin(value = "0.001", inclusive = true, message = "Current reading must be greater than 0")
    @Digits(integer = 7, fraction = 3, message = "Current reading: max 7 integer digits, 3 decimal places")
    private BigDecimal currentReading;

    @NotNull(message = "Reading date is required")
    @PastOrPresent(message = "Reading date cannot be in the future")
    private LocalDate readingDate;
}
