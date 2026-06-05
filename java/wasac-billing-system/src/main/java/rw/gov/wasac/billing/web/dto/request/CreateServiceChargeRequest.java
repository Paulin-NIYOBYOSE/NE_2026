package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.MeterType;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateServiceChargeRequest {
    @NotBlank
    private String name;

    @NotNull @DecimalMin("0.01")
    private BigDecimal amount;

    @NotNull
    private MeterType meterType;
}
