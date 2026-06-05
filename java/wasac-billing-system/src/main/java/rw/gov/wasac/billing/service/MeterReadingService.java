package rw.gov.wasac.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.*;
import rw.gov.wasac.billing.domain.enums.MeterStatus;
import rw.gov.wasac.billing.domain.repository.MeterReadingRepository;
import rw.gov.wasac.billing.exception.*;
import rw.gov.wasac.billing.web.dto.request.CreateMeterReadingRequest;
import rw.gov.wasac.billing.web.dto.response.MeterReadingResponse;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeterReadingService {

    private final MeterReadingRepository meterReadingRepository;
    private final MeterService meterService;

    @Transactional
    public MeterReadingResponse captureReading(CreateMeterReadingRequest request, User operator) {
        Meter meter = meterService.findById(request.getMeterId());

        if (meter.getStatus() != MeterStatus.ACTIVE) {
            throw new BusinessException("Cannot capture reading for inactive meter: " + meter.getMeterNumber());
        }
        if (request.getCurrentReading().compareTo(request.getPreviousReading()) <= 0) {
            throw new BusinessException("Current reading must be greater than previous reading");
        }

        int month = request.getReadingDate().getMonthValue();
        int year = request.getReadingDate().getYear();
        if (meterReadingRepository.existsByMeterAndReadingMonthAndReadingYear(meter, month, year)) {
            throw new DuplicateResourceException(
                "A reading for meter " + meter.getMeterNumber() + " already exists for " + month + "/" + year);
        }

        MeterReading reading = MeterReading.builder()
            .meter(meter)
            .previousReading(request.getPreviousReading())
            .currentReading(request.getCurrentReading())
            .consumption(request.getCurrentReading().subtract(request.getPreviousReading()))
            .readingDate(request.getReadingDate())
            .readingMonth(month)
            .readingYear(year)
            .recordedBy(operator)
            .build();
        return toResponse(meterReadingRepository.save(reading));
    }

    public List<MeterReadingResponse> getAllReadings() {
        return meterReadingRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public MeterReadingResponse getReadingById(Long id) {
        return toResponse(findById(id));
    }

    public List<MeterReadingResponse> getReadingsByMeter(Long meterId) {
        Meter meter = meterService.findById(meterId);
        return meterReadingRepository.findByMeterOrderByReadingYearDescReadingMonthDesc(meter)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public MeterReading findById(Long id) {
        return meterReadingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("MeterReading", id));
    }

    public MeterReadingResponse toResponse(MeterReading r) {
        return MeterReadingResponse.builder()
            .id(r.getId())
            .meterId(r.getMeter().getId())
            .meterNumber(r.getMeter().getMeterNumber())
            .previousReading(r.getPreviousReading())
            .currentReading(r.getCurrentReading())
            .consumption(r.getConsumption())
            .readingDate(r.getReadingDate())
            .readingMonth(r.getReadingMonth())
            .readingYear(r.getReadingYear())
            .recordedByName(r.getRecordedBy().getFullNames())
            .createdAt(r.getCreatedAt())
            .build();
    }
}
