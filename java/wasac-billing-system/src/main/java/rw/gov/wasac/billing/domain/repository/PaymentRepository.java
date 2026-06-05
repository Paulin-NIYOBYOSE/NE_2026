package rw.gov.wasac.billing.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.gov.wasac.billing.domain.entity.Bill;
import rw.gov.wasac.billing.domain.entity.Payment;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBillOrderByCreatedAtDesc(Bill bill);
    List<Payment> findByBill_Customer_IdOrderByCreatedAtDesc(Long customerId);
}
