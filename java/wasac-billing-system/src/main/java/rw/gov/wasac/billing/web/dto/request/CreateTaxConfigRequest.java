package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.AppliesTo;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateTaxConfigRequest {

    @NotBlank(message = "Tax name is required (e.g. VAT)")
    @Size(min = 2, max = 100, message = "Tax name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Tax rate is required")
    @DecimalMin(value = "0.0001", message = "Rate must be greater than 0 (e.g. 0.18 for 18%)")
    @DecimalMax(value = "0.9999", message = "Rate must be less than 1 (e.g. 0.18 for 18%, not 18)")
    @Digits(integer = 1, fraction = 4, message = "Rate must be a decimal between 0.0001 and 0.9999 (e.g. 0.18 = 18%)")
    private BigDecimal rate;

    @NotNull(message = "Applies to is required (WATER, ELECTRICITY, or ALL)")
    private AppliesTo appliesTo;
}
