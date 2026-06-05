package rw.gov.wasac.billing.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rw.gov.wasac.billing.domain.entity.Tariff;
import rw.gov.wasac.billing.domain.entity.TariffTier;

import java.util.List;

@Repository
public interface TariffTierRepository extends JpaRepository<TariffTier, Long> {
    List<TariffTier> findByTariffOrderByMinUnitsAsc(Tariff tariff);
}
