package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.RoleName;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AssignRoleRequest {
    @NotNull(message = "Role is required")
    private RoleName role;
}
