package rw.gov.wasac.billing.web.dto.response;

import lombok.*;
import rw.gov.wasac.billing.domain.enums.UserStatus;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponse {
    private Long id;
    private String fullNames;
    private String email;
    private String phoneNumber;
    private UserStatus status;
    private List<String> roles;
    private LocalDateTime createdAt;
}
