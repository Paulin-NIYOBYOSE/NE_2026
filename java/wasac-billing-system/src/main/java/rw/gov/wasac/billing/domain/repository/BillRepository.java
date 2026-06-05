package rw.gov.wasac.billing.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.gov.wasac.billing.domain.entity.Bill;
import rw.gov.wasac.billing.domain.entity.Customer;
import rw.gov.wasac.billing.domain.entity.Meter;
import rw.gov.wasac.billing.domain.entity.MeterReading;
import rw.gov.wasac.billing.domain.enums.BillStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    boolean existsByCustomerAndMeterAndBillingMonthAndBillingYear(
        Customer customer, Meter meter, Integer month, Integer year);
    Optional<Bill> findByBillReference(String billReference);
    List<Bill> findByCustomerOrderByCreatedAtDesc(Customer customer);
    List<Bill> findByCustomerAndStatus(Customer customer, BillStatus status);
    Optional<Bill> findByMeterReading(MeterReading meterReading);
}
