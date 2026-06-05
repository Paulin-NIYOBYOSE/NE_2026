package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.PenaltyType;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreatePenaltyRequest {

    @NotBlank(message = "Penalty name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotNull(message = "Penalty type is required (FIXED or PERCENTAGE)")
    private PenaltyType penaltyType;

    @DecimalMin(value = "0.01", message = "Fixed penalty amount must be at least 0.01 FRW")
    @Digits(integer = 8, fraction = 2, message = "Amount: max 8 integer digits, 2 decimal places")
    private BigDecimal amount;

    @DecimalMin(value = "0.0001", message = "Percentage rate must be greater than 0 (e.g. 0.05 = 5%)")
    @DecimalMax(value = "0.9999", message = "Percentage rate must be less than 1 (e.g. 0.05 = 5%, not 5)")
    @Digits(integer = 1, fraction = 4)
    private BigDecimal rate;

    @NotNull(message = "Days overdue is required")
    @Min(value = 1, message = "Days overdue must be at least 1 day")
    @Max(value = 3650, message = "Days overdue cannot exceed 3650 days (10 years)")
    private Integer daysOverdue;
}
