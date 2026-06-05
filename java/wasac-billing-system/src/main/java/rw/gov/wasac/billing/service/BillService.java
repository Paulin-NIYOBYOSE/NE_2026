package rw.gov.wasac.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.*;
import rw.gov.wasac.billing.domain.enums.*;
import rw.gov.wasac.billing.domain.repository.*;
import rw.gov.wasac.billing.exception.*;
import rw.gov.wasac.billing.web.dto.request.GenerateBillRequest;
import rw.gov.wasac.billing.web.dto.response.BillResponse;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final CustomerRepository customerRepository;
    private final MeterReadingService meterReadingService;
    private final TariffService tariffService;
    private final TaxConfigService taxConfigService;
    private final ServiceChargeService serviceChargeService;
    private final PenaltyService penaltyService;

    @Transactional
    public BillResponse generateBill(GenerateBillRequest request, User actor) {
        MeterReading reading = meterReadingService.findById(request.getMeterReadingId());
        Meter meter = reading.getMeter();
        Customer customer = meter.getCustomer();

        if (customer.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException("Inactive customers cannot receive bills");
        }
        if (billRepository.existsByCustomerAndMeterAndBillingMonthAndBillingYear(
            customer, meter, reading.getReadingMonth(), reading.getReadingYear())) {
            throw new DuplicateResourceException(
                "Bill already exists for this meter and billing period");
        }
        if (billRepository.findByMeterReading(reading).isPresent()) {
            throw new DuplicateResourceException("Bill already generated for this meter reading");
        }

        Tariff tariff = tariffService.findTariffForDate(meter.getMeterType(), reading.getReadingDate());
        BigDecimal consumption = reading.getConsumption();
        BigDecimal consumptionAmount = calculateConsumptionAmount(tariff, consumption);
        BigDecimal effectiveUnitPrice = tariff.getTariffType() == TariffType.FLAT
            ? tariff.getUnitPrice()
            : consumptionAmount.divide(consumption.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ONE : consumption,
                4, RoundingMode.HALF_UP);

        // Service charges
        BigDecimal totalServiceCharge = serviceChargeService
            .getActiveByMeterType(meter.getMeterType()).stream()
            .map(ServiceCharge::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // subtotal = consumption cost + fixed service charges
        BigDecimal subtotal = consumptionAmount.add(totalServiceCharge);

        // VAT applied on subtotal (not on consumption alone)
        AppliesTo appliesTo = meter.getMeterType() == MeterType.WATER ? AppliesTo.WATER : AppliesTo.ELECTRICITY;
        BigDecimal totalTaxRate = taxConfigService.getActiveForMeterType(appliesTo).stream()
            .map(TaxConfig::getRate)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal taxAmount = subtotal.multiply(totalTaxRate).setScale(2, RoundingMode.HALF_UP);

        // Penalty applied only when customer has overdue approved bills
        BigDecimal penaltyAmount = calculatePenaltyForCustomer(customer, consumptionAmount);

        BigDecimal totalAmount = subtotal.add(taxAmount).add(penaltyAmount);
        String reference = generateBillReference(meter.getMeterType(), reading.getReadingYear(), reading.getReadingMonth());

        Bill bill = Bill.builder()
            .billReference(reference)
            .customer(customer)
            .meter(meter)
            .meterReading(reading)
            .billingMonth(reading.getReadingMonth())
            .billingYear(reading.getReadingYear())
            .consumption(consumption)
            .unitPrice(effectiveUnitPrice)
            .consumptionAmount(consumptionAmount)
            .serviceCharge(totalServiceCharge)
            .taxAmount(taxAmount)
            .penaltyAmount(penaltyAmount)
            .totalAmount(totalAmount)
            .amountPaid(BigDecimal.ZERO)
            .outstandingBalance(totalAmount)
            .status(BillStatus.PENDING)
            .dueDate(LocalDate.now().plusDays(30))
            .build();

        return toResponse(billRepository.save(bill));
    }

    private BigDecimal calculateConsumptionAmount(Tariff tariff, BigDecimal consumption) {
        if (tariff.getTariffType() == TariffType.FLAT) {
            return consumption.multiply(tariff.getUnitPrice()).setScale(2, RoundingMode.HALF_UP);
        }
        // Tier-based calculation
        List<TariffTier> tiers = tariff.getTiers().stream()
            .sorted((a, b) -> a.getMinUnits().compareTo(b.getMinUnits()))
            .collect(Collectors.toList());

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal remaining = consumption;
        for (TariffTier tier : tiers) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
            BigDecimal tierMax = tier.getMaxUnits() != null ? tier.getMaxUnits() : remaining;
            BigDecimal tierRange = tierMax.subtract(tier.getMinUnits());
            BigDecimal inTier = remaining.min(tierRange);
            total = total.add(inTier.multiply(tier.getUnitPrice()));
            remaining = remaining.subtract(inTier);
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculatePenaltyForCustomer(Customer customer, BigDecimal consumptionAmount) {
        List<Bill> overdueBills = billRepository.findByCustomerAndStatus(customer, BillStatus.APPROVED)
            .stream()
            .filter(b -> b.getDueDate().isBefore(LocalDate.now()) && b.getOutstandingBalance().compareTo(BigDecimal.ZERO) > 0)
            .collect(Collectors.toList());

        if (overdueBills.isEmpty()) return BigDecimal.ZERO;

        int maxDaysOverdue = overdueBills.stream()
            .mapToInt(b -> (int) (LocalDate.now().toEpochDay() - b.getDueDate().toEpochDay()))
            .max().orElse(0);

        return penaltyService.getApplicable(maxDaysOverdue).stream()
            .findFirst()
            .map(p -> p.getPenaltyType() == PenaltyType.FIXED
                ? p.getAmount()
                : consumptionAmount.multiply(p.getRate()).setScale(2, RoundingMode.HALF_UP))
            .orElse(BigDecimal.ZERO);
    }

    private String generateBillReference(MeterType meterType, int year, int month) {
        String typeCode = meterType == MeterType.WATER ? "W" : "E";
        String uniquePart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return String.format("WASAC-%d-%02d-%s-%s", year, month, typeCode, uniquePart);
    }

    public List<BillResponse> getAllBills() {
        return billRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BillResponse getBillById(Long id) {
        return toResponse(findById(id));
    }

    public List<BillResponse> getBillsByCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));
        return billRepository.findByCustomerOrderByCreatedAtDesc(customer)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public BillResponse approveBill(Long id, User actor) {
        Bill bill = findById(id);
        if (bill.getStatus() != BillStatus.PENDING) {
            throw new BusinessException("Only PENDING bills can be approved");
        }
        bill.setStatus(BillStatus.APPROVED);
        bill.setApprovedBy(actor);
        bill.setApprovedAt(LocalDateTime.now());
        return toResponse(billRepository.save(bill));
    }

    @Transactional
    public BillResponse rejectBill(Long id, User actor) {
        Bill bill = findById(id);
        if (bill.getStatus() != BillStatus.PENDING) {
            throw new BusinessException("Only PENDING bills can be rejected");
        }
        bill.setStatus(BillStatus.REJECTED);
        bill.setApprovedBy(actor);
        bill.setApprovedAt(LocalDateTime.now());
        return toResponse(billRepository.save(bill));
    }

    public Bill findById(Long id) {
        return billRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bill", id));
    }

    public Bill findByReference(String reference) {
        return billRepository.findByBillReference(reference)
            .orElseThrow(() -> new ResourceNotFoundException("Bill not found with reference: " + reference));
    }

    public List<BillResponse> getMyBills(User user) {
        return billRepository.findByCustomer_User_IdOrderByCreatedAtDesc(user.getId())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Used by MonthlyBillingJob — no User actor needed (actor not persisted on bill)
    @Transactional
    public BillResponse generateBillFromReading(MeterReading reading) {
        return generateBill(new GenerateBillRequest(reading.getId()), null);
    }

    public BillResponse toResponse(Bill b) {
        return BillResponse.builder()
            .id(b.getId()).billReference(b.getBillReference())
            .customerId(b.getCustomer().getId()).customerName(b.getCustomer().getFullNames())
            .meterId(b.getMeter().getId()).meterNumber(b.getMeter().getMeterNumber())
            .billingMonth(b.getBillingMonth()).billingYear(b.getBillingYear())
            .consumption(b.getConsumption()).unitPrice(b.getUnitPrice())
            .consumptionAmount(b.getConsumptionAmount()).serviceCharge(b.getServiceCharge())
            .taxAmount(b.getTaxAmount()).penaltyAmount(b.getPenaltyAmount())
            .totalAmount(b.getTotalAmount()).amountPaid(b.getAmountPaid())
            .outstandingBalance(b.getOutstandingBalance()).status(b.getStatus())
            .dueDate(b.getDueDate()).createdAt(b.getCreatedAt()).build();
    }
}
