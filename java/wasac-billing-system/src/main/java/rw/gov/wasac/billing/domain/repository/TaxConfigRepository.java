package rw.gov.wasac.billing.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import rw.gov.wasac.billing.domain.entity.TaxConfig;
import rw.gov.wasac.billing.domain.enums.AppliesTo;
import rw.gov.wasac.billing.domain.enums.MeterType;

import java.util.List;

@Repository
public interface TaxConfigRepository extends JpaRepository<TaxConfig, Long> {
    @Query("SELECT t FROM TaxConfig t WHERE t.isActive = true AND (t.appliesTo = :appliesTo OR t.appliesTo = rw.gov.wasac.billing.domain.enums.AppliesTo.ALL)")
    List<TaxConfig> findActiveForMeterType(AppliesTo appliesTo);
    List<TaxConfig> findByIsActiveTrue();
}
