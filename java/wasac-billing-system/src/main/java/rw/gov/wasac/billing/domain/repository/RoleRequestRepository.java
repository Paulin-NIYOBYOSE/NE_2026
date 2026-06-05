package rw.gov.wasac.billing.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.gov.wasac.billing.domain.entity.RoleRequest;
import rw.gov.wasac.billing.domain.entity.User;
import rw.gov.wasac.billing.domain.enums.RoleRequestStatus;

import java.util.List;

@Repository
public interface RoleRequestRepository extends JpaRepository<RoleRequest, Long> {
    List<RoleRequest> findByUser(User user);
    List<RoleRequest> findByStatus(RoleRequestStatus status);
    boolean existsByUserAndStatus(User user, RoleRequestStatus status);
}
