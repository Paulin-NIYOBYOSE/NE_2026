package rw.gov.wasac.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.*;
import rw.gov.wasac.billing.domain.enums.MeterType;
import rw.gov.wasac.billing.domain.enums.TariffType;
import rw.gov.wasac.billing.domain.repository.TariffRepository;
import rw.gov.wasac.billing.exception.*;
import rw.gov.wasac.billing.web.dto.request.CreateTariffRequest;
import rw.gov.wasac.billing.web.dto.response.TariffResponse;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TariffService {

    private final TariffRepository tariffRepository;

    @Transactional
    public TariffResponse createTariff(CreateTariffRequest request, User admin) {
        if (request.getTariffType() == TariffType.FLAT && request.getUnitPrice() == null) {
            throw new BusinessException("Unit price is required for FLAT tariff");
        }
        if (request.getTariffType() == TariffType.TIER_BASED &&
            (request.getTiers() == null || request.getTiers().isEmpty())) {
            throw new BusinessException("Tiers are required for TIER_BASED tariff");
        }

        // Invalidate previous current tariff for this meter type
        tariffRepository.findByMeterTypeAndIsCurrentTrue(request.getMeterType())
            .ifPresent(t -> { t.setIsCurrent(false); tariffRepository.save(t); });

        int newVersion = tariffRepository.findByMeterTypeOrderByVersionDesc(request.getMeterType())
            .stream().findFirst().map(t -> t.getVersion() + 1).orElse(1);

        Tariff tariff = Tariff.builder()
            .meterType(request.getMeterType())
            .tariffType(request.getTariffType())
            .unitPrice(request.getUnitPrice())
            .version(newVersion)
            .effectiveFrom(request.getEffectiveFrom())
            .isCurrent(true)
            .createdBy(admin)
            .build();

        if (request.getTiers() != null) {
            List<TariffTier> tiers = request.getTiers().stream()
                .map(t -> TariffTier.builder()
                    .tariff(tariff)
                    .minUnits(t.getMinUnits())
                    .maxUnits(t.getMaxUnits())
                    .unitPrice(t.getUnitPrice())
                    .build())
                .collect(Collectors.toList());
            tariff.setTiers(tiers);
        }
        return toResponse(tariffRepository.save(tariff));
    }

    public List<TariffResponse> getAllTariffs() {
        return tariffRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TariffResponse getTariffById(Long id) {
        return toResponse(findById(id));
    }

    public TariffResponse getCurrentTariff(MeterType meterType) {
        return toResponse(tariffRepository.findByMeterTypeAndIsCurrentTrue(meterType)
            .orElseThrow(() -> new ResourceNotFoundException("No current tariff found for " + meterType)));
    }

    public Tariff findCurrentTariffEntity(MeterType meterType) {
        return tariffRepository.findByMeterTypeAndIsCurrentTrue(meterType)
            .orElseThrow(() -> new BusinessException("No active tariff configured for " + meterType));
    }

    public Tariff findById(Long id) {
        return tariffRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tariff", id));
    }

    public TariffResponse toResponse(Tariff t) {
        List<TariffResponse.TierResponse> tiers = t.getTiers().stream()
            .map(tier -> TariffResponse.TierResponse.builder()
                .id(tier.getId())
                .minUnits(tier.getMinUnits())
                .maxUnits(tier.getMaxUnits())
                .unitPrice(tier.getUnitPrice())
                .build())
            .collect(Collectors.toList());
        return TariffResponse.builder()
            .id(t.getId()).meterType(t.getMeterType()).tariffType(t.getTariffType())
            .unitPrice(t.getUnitPrice()).version(t.getVersion()).effectiveFrom(t.getEffectiveFrom())
            .isCurrent(t.getIsCurrent()).createdAt(t.getCreatedAt()).tiers(tiers).build();
    }
}
