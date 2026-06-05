package rw.gov.wasac.billing.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rw.gov.wasac.billing.domain.entity.Tariff;
import rw.gov.wasac.billing.domain.enums.MeterType;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TariffRepository extends JpaRepository<Tariff, Long> {
    Optional<Tariff> findByMeterTypeAndIsCurrentTrue(MeterType meterType);
    List<Tariff> findByMeterTypeOrderByVersionDesc(MeterType meterType);

    // Finds the tariff whose validity window covers the given date
    @Query("SELECT t FROM Tariff t WHERE t.meterType = :meterType " +
           "AND t.effectiveFrom <= :date " +
           "AND (t.effectiveTo IS NULL OR t.effectiveTo >= :date) " +
           "ORDER BY t.version DESC")
    List<Tariff> findByMeterTypeAndDate(@Param("meterType") MeterType meterType,
                                        @Param("date") LocalDate date);
}
