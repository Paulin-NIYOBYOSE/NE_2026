package rw.gov.wasac.billing.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import rw.gov.wasac.billing.domain.entity.Penalty;

import java.util.List;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {
    List<Penalty> findByIsActiveTrue();
    @Query("SELECT p FROM Penalty p WHERE p.isActive = true AND p.daysOverdue <= :daysOverdue ORDER BY p.daysOverdue DESC")
    List<Penalty> findApplicablePenalties(int daysOverdue);
}
