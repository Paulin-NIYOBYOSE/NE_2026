package rw.gov.wasac.billing.web.dto.response;

import lombok.*;
import rw.gov.wasac.billing.domain.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long billId;
    private String billReference;
    private BigDecimal amountPaid;
    private PaymentMethod paymentMethod;
    private LocalDateTime paymentDate;
    private String referenceNumber;
    private String recordedByName;
    private LocalDateTime createdAt;
}
