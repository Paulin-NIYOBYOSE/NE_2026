package rw.gov.wasac.billing.web.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import rw.gov.wasac.billing.domain.enums.RoleName;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RoleRequestDto {

    @NotNull(message = "Requested role is required (ROLE_OPERATOR, ROLE_FINANCE, or ROLE_ADMIN)")
    private RoleName requestedRole;
}
