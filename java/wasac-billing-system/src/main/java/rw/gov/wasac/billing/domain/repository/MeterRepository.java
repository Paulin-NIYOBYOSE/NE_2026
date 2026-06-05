package rw.gov.wasac.billing.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.gov.wasac.billing.domain.entity.Customer;
import rw.gov.wasac.billing.domain.entity.Meter;
import rw.gov.wasac.billing.domain.enums.MeterStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeterRepository extends JpaRepository<Meter, Long> {
    boolean existsByMeterNumber(String meterNumber);
    Optional<Meter> findByMeterNumber(String meterNumber);
    List<Meter> findByCustomer(Customer customer);
    List<Meter> findByCustomerAndStatus(Customer customer, MeterStatus status);
    List<Meter> findByStatus(MeterStatus status);
}
