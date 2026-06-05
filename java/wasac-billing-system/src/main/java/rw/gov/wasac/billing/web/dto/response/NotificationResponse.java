package rw.gov.wasac.billing.web.dto.response;

import lombok.*;
import rw.gov.wasac.billing.domain.enums.NotificationType;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long customerId;
    private String message;
    private NotificationType notificationType;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
