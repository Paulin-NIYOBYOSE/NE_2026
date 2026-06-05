package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class GenerateBillRequest {

    @NotNull(message = "Meter reading ID is required")
    @Positive(message = "Meter reading ID must be a positive number")
    private Long meterReadingId;
}
