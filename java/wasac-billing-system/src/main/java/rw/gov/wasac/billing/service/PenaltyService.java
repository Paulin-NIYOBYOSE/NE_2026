package rw.gov.wasac.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.Penalty;
import rw.gov.wasac.billing.domain.repository.PenaltyRepository;
import rw.gov.wasac.billing.exception.BusinessException;
import rw.gov.wasac.billing.exception.ResourceNotFoundException;
import rw.gov.wasac.billing.web.dto.request.CreatePenaltyRequest;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;

    @Transactional
    public Penalty create(CreatePenaltyRequest request) {
        if (request.getPenaltyType().name().equals("FIXED") && request.getAmount() == null) {
            throw new BusinessException("Amount is required for FIXED penalty type");
        }
        if (request.getPenaltyType().name().equals("PERCENTAGE") && request.getRate() == null) {
            throw new BusinessException("Rate is required for PERCENTAGE penalty type");
        }
        return penaltyRepository.save(Penalty.builder()
            .name(request.getName())
            .penaltyType(request.getPenaltyType())
            .amount(request.getAmount())
            .rate(request.getRate())
            .daysOverdue(request.getDaysOverdue())
            .isActive(true)
            .build());
    }

    public List<Penalty> getAll() { return penaltyRepository.findAll(); }

    @Transactional
    public Penalty toggleActive(Long id) {
        Penalty p = findById(id);
        p.setIsActive(!p.getIsActive());
        return penaltyRepository.save(p);
    }

    public List<Penalty> getApplicable(int daysOverdue) {
        return penaltyRepository.findApplicablePenalties(daysOverdue);
    }

    public Penalty findById(Long id) {
        return penaltyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Penalty", id));
    }
}
