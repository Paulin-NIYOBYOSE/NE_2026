package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RecordPaymentRequest {

    @NotBlank(message = "Bill reference is required (e.g. WASAC-2024-06-W-000001)")
    @Pattern(
        regexp = "^WASAC-[0-9]{4}-[0-9]{2}-[WE]-[A-Z0-9]{8}$",
        message = "Bill reference must follow the format: WASAC-YYYY-MM-W/E-XXXXXXXX"
    )
    private String billReference;

    @NotNull(message = "Amount paid is required")
    @DecimalMin(value = "0.01", message = "Payment amount must be at least 0.01 FRW")
    @Digits(integer = 10, fraction = 2, message = "Amount: max 10 integer digits, 2 decimal places")
    private BigDecimal amountPaid;

    @NotNull(message = "Payment method is required (CASH, MOBILE_MONEY, or BANK_TRANSFER)")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Payment date is required")
    @PastOrPresent(message = "Payment date cannot be in the future")
    private LocalDateTime paymentDate;

    @Size(max = 100, message = "Reference number must not exceed 100 characters")
    private String referenceNumber;
}
