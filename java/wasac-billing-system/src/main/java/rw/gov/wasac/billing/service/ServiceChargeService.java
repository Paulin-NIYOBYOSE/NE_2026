package rw.gov.wasac.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.ServiceCharge;
import rw.gov.wasac.billing.domain.enums.MeterType;
import rw.gov.wasac.billing.domain.repository.ServiceChargeRepository;
import rw.gov.wasac.billing.exception.ResourceNotFoundException;
import rw.gov.wasac.billing.web.dto.request.CreateServiceChargeRequest;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceChargeService {

    private final ServiceChargeRepository serviceChargeRepository;

    @Transactional
    public ServiceCharge create(CreateServiceChargeRequest request) {
        return serviceChargeRepository.save(ServiceCharge.builder()
            .name(request.getName())
            .amount(request.getAmount())
            .meterType(request.getMeterType())
            .isActive(true)
            .build());
    }

    public List<ServiceCharge> getAll() { return serviceChargeRepository.findAll(); }

    @Transactional
    public ServiceCharge toggleActive(Long id) {
        ServiceCharge sc = findById(id);
        sc.setIsActive(!sc.getIsActive());
        return serviceChargeRepository.save(sc);
    }

    @Transactional
    public ServiceCharge update(Long id, CreateServiceChargeRequest request) {
        ServiceCharge sc = findById(id);
        sc.setName(request.getName());
        sc.setAmount(request.getAmount());
        sc.setMeterType(request.getMeterType());
        return serviceChargeRepository.save(sc);
    }

    public List<ServiceCharge> getActiveByMeterType(MeterType meterType) {
        return serviceChargeRepository.findByMeterTypeAndIsActiveTrue(meterType);
    }

    public ServiceCharge findById(Long id) {
        return serviceChargeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("ServiceCharge", id));
    }
}
