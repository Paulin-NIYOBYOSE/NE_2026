package rw.gov.wasac.billing.web.dto.response;

import lombok.*;
import rw.gov.wasac.billing.domain.enums.UserStatus;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String fullNames;
    private String nationalId;
    private String email;
    private String phoneNumber;
    private String address;
    private UserStatus status;
    private Long linkedUserId;
    private LocalDateTime createdAt;
}
