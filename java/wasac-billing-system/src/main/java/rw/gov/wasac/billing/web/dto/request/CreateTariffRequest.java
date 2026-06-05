package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.MeterType;
import rw.gov.wasac.billing.domain.enums.TariffType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateTariffRequest {
    @NotNull
    private MeterType meterType;

    @NotNull
    private TariffType tariffType;

    private BigDecimal unitPrice;

    @NotNull(message = "Effective date is required")
    private LocalDate effectiveFrom;

    private List<TierRequest> tiers;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class TierRequest {
        @NotNull
        private BigDecimal minUnits;
        private BigDecimal maxUnits;
        @NotNull
        private BigDecimal unitPrice;
    }
}
