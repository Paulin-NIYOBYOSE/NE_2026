package rw.gov.wasac.billing.web.dto.response;

import lombok.*;
import rw.gov.wasac.billing.domain.enums.BillStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BillResponse {
    private Long id;
    private String billReference;
    private Long customerId;
    private String customerName;
    private Long meterId;
    private String meterNumber;
    private Integer billingMonth;
    private Integer billingYear;
    private BigDecimal consumption;
    private BigDecimal unitPrice;
    private BigDecimal consumptionAmount;
    private BigDecimal serviceCharge;
    private BigDecimal taxAmount;
    private BigDecimal penaltyAmount;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal outstandingBalance;
    private BillStatus status;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
}
