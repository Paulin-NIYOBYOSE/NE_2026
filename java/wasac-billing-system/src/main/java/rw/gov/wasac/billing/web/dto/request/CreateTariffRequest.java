package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.MeterType;
import rw.gov.wasac.billing.domain.enums.TariffType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateTariffRequest {

    @NotNull(message = "Meter type is required (WATER or ELECTRICITY)")
    private MeterType meterType;

    @NotNull(message = "Tariff type is required (FLAT or TIER_BASED)")
    private TariffType tariffType;

    @DecimalMin(value = "0.0001", message = "Unit price must be greater than 0")
    @Digits(integer = 6, fraction = 4, message = "Unit price: max 6 integer digits, 4 decimal places")
    private BigDecimal unitPrice;

    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;

    @Valid
    private List<TierRequest> tiers;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class TierRequest {

        @NotNull(message = "Minimum units for tier is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Min units must be 0 or greater")
        @Digits(integer = 7, fraction = 3)
        private BigDecimal minUnits;

        @Digits(integer = 7, fraction = 3, message = "Max units: max 7 integer digits, 3 decimal places")
        private BigDecimal maxUnits;

        @NotNull(message = "Unit price for tier is required")
        @DecimalMin(value = "0.0001", message = "Tier unit price must be greater than 0")
        @Digits(integer = 6, fraction = 4)
        private BigDecimal unitPrice;
    }
}
