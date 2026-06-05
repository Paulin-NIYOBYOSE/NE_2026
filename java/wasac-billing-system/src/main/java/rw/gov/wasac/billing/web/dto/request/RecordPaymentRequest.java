package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RecordPaymentRequest {
    @NotBlank(message = "Bill reference is required")
    private String billReference;

    @NotNull @DecimalMin("0.01")
    private BigDecimal amountPaid;

    @NotNull
    private PaymentMethod paymentMethod;

    @NotNull
    private LocalDateTime paymentDate;

    private String referenceNumber;
}
