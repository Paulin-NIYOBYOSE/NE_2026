package rw.gov.wasac.billing.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.gov.wasac.billing.domain.entity.Customer;
import rw.gov.wasac.billing.domain.entity.User;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByNationalId(String nationalId);
    boolean existsByEmail(String email);
    Optional<Customer> findByNationalId(String nationalId);
    Optional<Customer> findByUser(User user);
}
