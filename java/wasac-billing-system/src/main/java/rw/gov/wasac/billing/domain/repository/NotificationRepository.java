package rw.gov.wasac.billing.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.gov.wasac.billing.domain.entity.Customer;
import rw.gov.wasac.billing.domain.entity.Notification;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByCustomerOrderByCreatedAtDesc(Customer customer);
    List<Notification> findByCustomerAndIsReadFalseOrderByCreatedAtDesc(Customer customer);
    long countByCustomerAndIsReadFalse(Customer customer);
}
