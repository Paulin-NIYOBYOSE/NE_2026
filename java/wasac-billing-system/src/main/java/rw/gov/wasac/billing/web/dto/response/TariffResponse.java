package rw.gov.wasac.billing.web.dto.response;

import lombok.*;
import rw.gov.wasac.billing.domain.enums.MeterType;
import rw.gov.wasac.billing.domain.enums.TariffType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TariffResponse {
    private Long id;
    private MeterType meterType;
    private TariffType tariffType;
    private BigDecimal unitPrice;
    private Integer version;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Boolean isCurrent;
    private LocalDateTime createdAt;
    private List<TierResponse> tiers;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TierResponse {
        private Long id;
        private BigDecimal minUnits;
        private BigDecimal maxUnits;
        private BigDecimal unitPrice;
    }
}
