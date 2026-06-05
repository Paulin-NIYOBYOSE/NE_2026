package rw.gov.wasac.billing.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.gov.wasac.billing.domain.entity.Tariff;
import rw.gov.wasac.billing.domain.enums.MeterType;

import java.util.List;
import java.util.Optional;

@Repository
public interface TariffRepository extends JpaRepository<Tariff, Long> {
    Optional<Tariff> findByMeterTypeAndIsCurrentTrue(MeterType meterType);
    List<Tariff> findByMeterTypeOrderByVersionDesc(MeterType meterType);
    Optional<Integer> findTopVersionByMeterType(MeterType meterType);
}
