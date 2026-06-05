package rw.gov.wasac.billing.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.gov.wasac.billing.domain.entity.ServiceCharge;
import rw.gov.wasac.billing.domain.enums.MeterType;

import java.util.List;

@Repository
public interface ServiceChargeRepository extends JpaRepository<ServiceCharge, Long> {
    List<ServiceCharge> findByMeterTypeAndIsActiveTrue(MeterType meterType);
    List<ServiceCharge> findByIsActiveTrue();
}
