package rw.gov.wasac.billing.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.gov.wasac.billing.domain.entity.Meter;
import rw.gov.wasac.billing.domain.entity.MeterReading;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {
    boolean existsByMeterAndReadingMonthAndReadingYear(Meter meter, Integer month, Integer year);
    Optional<MeterReading> findByMeterAndReadingMonthAndReadingYear(Meter meter, Integer month, Integer year);
    List<MeterReading> findByMeterOrderByReadingYearDescReadingMonthDesc(Meter meter);
    Optional<MeterReading> findTopByMeterOrderByReadingYearDescReadingMonthDesc(Meter meter);
}
