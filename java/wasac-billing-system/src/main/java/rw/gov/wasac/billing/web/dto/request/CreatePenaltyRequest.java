package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.PenaltyType;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreatePenaltyRequest {
    @NotBlank
    private String name;

    @NotNull
    private PenaltyType penaltyType;

    private BigDecimal amount;
    private BigDecimal rate;

    @NotNull @Min(1)
    private Integer daysOverdue;
}
