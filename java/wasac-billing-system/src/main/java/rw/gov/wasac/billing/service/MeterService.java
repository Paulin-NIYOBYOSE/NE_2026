package rw.gov.wasac.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.Customer;
import rw.gov.wasac.billing.domain.entity.Meter;
import rw.gov.wasac.billing.domain.enums.MeterStatus;
import rw.gov.wasac.billing.domain.repository.MeterRepository;
import rw.gov.wasac.billing.exception.*;
import rw.gov.wasac.billing.web.dto.request.CreateMeterRequest;
import rw.gov.wasac.billing.web.dto.response.MeterResponse;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeterService {

    private final MeterRepository meterRepository;
    private final CustomerService customerService;

    @Transactional
    public MeterResponse createMeter(CreateMeterRequest request) {
        if (meterRepository.existsByMeterNumber(request.getMeterNumber())) {
            throw new DuplicateResourceException("Meter number already exists: " + request.getMeterNumber());
        }
        Customer customer = customerService.findById(request.getCustomerId());
        Meter meter = Meter.builder()
            .meterNumber(request.getMeterNumber())
            .meterType(request.getMeterType())
            .installationDate(request.getInstallationDate())
            .status(MeterStatus.ACTIVE)
            .customer(customer)
            .build();
        return toResponse(meterRepository.save(meter));
    }

    public List<MeterResponse> getAllMeters() {
        return meterRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public MeterResponse getMeterById(Long id) {
        return toResponse(findById(id));
    }

    public List<MeterResponse> getMetersByCustomer(Long customerId) {
        Customer customer = customerService.findById(customerId);
        return meterRepository.findByCustomer(customer).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deactivateMeter(Long id) {
        Meter meter = findById(id);
        meter.setStatus(MeterStatus.INACTIVE);
        meterRepository.save(meter);
    }

    @Transactional
    public void activateMeter(Long id) {
        Meter meter = findById(id);
        meter.setStatus(MeterStatus.ACTIVE);
        meterRepository.save(meter);
    }

    public Meter findById(Long id) {
        return meterRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Meter", id));
    }

    public MeterResponse toResponse(Meter m) {
        return MeterResponse.builder()
            .id(m.getId())
            .meterNumber(m.getMeterNumber())
            .meterType(m.getMeterType())
            .installationDate(m.getInstallationDate())
            .status(m.getStatus())
            .customerId(m.getCustomer().getId())
            .customerName(m.getCustomer().getFullNames())
            .createdAt(m.getCreatedAt())
            .build();
    }
}
