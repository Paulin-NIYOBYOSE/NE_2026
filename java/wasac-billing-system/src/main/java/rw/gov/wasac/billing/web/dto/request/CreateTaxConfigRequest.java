package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.AppliesTo;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateTaxConfigRequest {
    @NotBlank
    private String name;

    @NotNull @DecimalMin("0.0001") @DecimalMax("1.0")
    private BigDecimal rate;

    @NotNull
    private AppliesTo appliesTo;
}
