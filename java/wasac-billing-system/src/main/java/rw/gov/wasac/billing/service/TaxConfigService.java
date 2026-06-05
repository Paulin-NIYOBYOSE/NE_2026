package rw.gov.wasac.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.TaxConfig;
import rw.gov.wasac.billing.domain.enums.AppliesTo;
import rw.gov.wasac.billing.domain.repository.TaxConfigRepository;
import rw.gov.wasac.billing.exception.ResourceNotFoundException;
import rw.gov.wasac.billing.web.dto.request.CreateTaxConfigRequest;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaxConfigService {

    private final TaxConfigRepository taxConfigRepository;

    @Transactional
    public TaxConfig createTaxConfig(CreateTaxConfigRequest request) {
        TaxConfig tax = TaxConfig.builder()
            .name(request.getName())
            .rate(request.getRate())
            .appliesTo(request.getAppliesTo())
            .isActive(true)
            .build();
        return taxConfigRepository.save(tax);
    }

    public List<TaxConfig> getAllTaxConfigs() { return taxConfigRepository.findAll(); }

    @Transactional
    public TaxConfig toggleActive(Long id) {
        TaxConfig tax = findById(id);
        tax.setIsActive(!tax.getIsActive());
        return taxConfigRepository.save(tax);
    }

    @Transactional
    public TaxConfig update(Long id, CreateTaxConfigRequest request) {
        TaxConfig tax = findById(id);
        tax.setName(request.getName());
        tax.setRate(request.getRate());
        tax.setAppliesTo(request.getAppliesTo());
        return taxConfigRepository.save(tax);
    }

    public List<TaxConfig> getActiveForMeterType(AppliesTo appliesTo) {
        return taxConfigRepository.findActiveForMeterType(appliesTo);
    }

    public TaxConfig findById(Long id) {
        return taxConfigRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("TaxConfig", id));
    }
}
