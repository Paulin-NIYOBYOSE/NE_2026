package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.MeterType;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateServiceChargeRequest {

    @NotBlank(message = "Service charge name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be at least 0.01 FRW")
    @Digits(integer = 8, fraction = 2, message = "Amount: max 8 integer digits, 2 decimal places")
    private BigDecimal amount;

    @NotNull(message = "Meter type is required (WATER or ELECTRICITY)")
    private MeterType meterType;
}
