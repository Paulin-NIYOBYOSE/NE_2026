package rw.gov.wasac.billing.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.Meter;
import rw.gov.wasac.billing.domain.entity.MeterReading;
import rw.gov.wasac.billing.domain.enums.MeterStatus;
import rw.gov.wasac.billing.domain.enums.UserStatus;
import rw.gov.wasac.billing.domain.repository.BillRepository;
import rw.gov.wasac.billing.domain.repository.MeterReadingRepository;
import rw.gov.wasac.billing.domain.repository.MeterRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class MonthlyBillingJob {

    private final MeterRepository meterRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final BillRepository billRepository;
    private final BillService billService;

    // Runs at 02:00 on the 1st of every month — generates bills for the previous month
    @Scheduled(cron = "0 0 2 1 * *")
    @Transactional
    public void generateMonthlyBills() {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        int month = lastMonth.getMonthValue();
        int year  = lastMonth.getYear();

        log.info("Monthly billing job started for {}/{}", month, year);

        List<Meter> activeMeters = meterRepository.findByStatus(MeterStatus.ACTIVE);
        int generated = 0;
        int skipped   = 0;

        for (Meter meter : activeMeters) {
            try {
                if (meter.getCustomer().getStatus() != UserStatus.ACTIVE) { skipped++; continue; }

                Optional<MeterReading> reading =
                    meterReadingRepository.findByMeterAndReadingMonthAndReadingYear(meter, month, year);
                if (reading.isEmpty()) { skipped++; continue; }

                if (billRepository.existsByCustomerAndMeterAndBillingMonthAndBillingYear(
                        meter.getCustomer(), meter, month, year)) { skipped++; continue; }

                billService.generateBillFromReading(reading.get());
                generated++;

            } catch (Exception e) {
                log.error("Auto-billing failed for meter {}: {}", meter.getMeterNumber(), e.getMessage());
                skipped++;
            }
        }

        log.info("Monthly billing job complete for {}/{} — generated: {}, skipped/no-reading: {}",
            month, year, generated, skipped);
    }
}
