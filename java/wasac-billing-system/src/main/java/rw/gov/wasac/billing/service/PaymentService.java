package rw.gov.wasac.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.*;
import rw.gov.wasac.billing.domain.enums.BillStatus;
import rw.gov.wasac.billing.domain.enums.NotificationType;
import rw.gov.wasac.billing.domain.repository.*;
import rw.gov.wasac.billing.exception.BusinessException;
import rw.gov.wasac.billing.web.dto.request.RecordPaymentRequest;
import rw.gov.wasac.billing.web.dto.response.PaymentResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillService billService;
    private final BillRepository billRepository;
    private final CustomerService customerService;
    private final NotificationService notificationService;

    @Transactional
    public PaymentResponse recordPayment(RecordPaymentRequest request, User finance) {
        Bill bill = billService.findByReference(request.getBillReference());

        if (bill.getStatus() == BillStatus.REJECTED) {
            throw new BusinessException("Cannot record payment for a REJECTED bill");
        }
        if (bill.getStatus() == BillStatus.PAID) {
            throw new BusinessException("Bill is already fully paid");
        }
        if (bill.getStatus() == BillStatus.PENDING) {
            throw new BusinessException("Bill must be APPROVED before payment can be recorded");
        }
        if (request.getAmountPaid().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Payment amount must be greater than zero");
        }

        BigDecimal outstanding = bill.getOutstandingBalance();
        BigDecimal paid = request.getAmountPaid().min(outstanding); // cap at outstanding balance

        Payment payment = Payment.builder()
            .bill(bill)
            .amountPaid(paid)
            .paymentMethod(request.getPaymentMethod())
            .paymentDate(request.getPaymentDate())
            .recordedBy(finance)
            .referenceNumber(request.getReferenceNumber())
            .build();
        paymentRepository.save(payment);

        // Update bill balances
        bill.setAmountPaid(bill.getAmountPaid().add(paid));
        bill.setOutstandingBalance(bill.getTotalAmount().subtract(bill.getAmountPaid()));

        boolean fullyPaid = false;
        if (bill.getOutstandingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            bill.setOutstandingBalance(BigDecimal.ZERO);
            bill.setStatus(BillStatus.PAID);
            fullyPaid = true;
        }
        billRepository.save(bill);

        Customer customer = bill.getCustomer();
        String msg = fullyPaid
            ? String.format("Your payment of <strong>%,.2f FRW</strong> has been received. " +
                "Bill <strong>%s</strong> is now <strong>fully paid</strong>. Thank you!",
                paid, bill.getBillReference())
            : String.format("Your payment of <strong>%,.2f FRW</strong> has been recorded for bill " +
                "<strong>%s</strong>. Remaining balance: <strong>%,.2f FRW</strong>.",
                paid, bill.getBillReference(), bill.getOutstandingBalance());
        notificationService.sendAndSave(customer, NotificationType.PAYMENT_CONFIRMED, msg);

        return toResponse(payment);
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PaymentResponse getPaymentById(Long id) {
        return toResponse(paymentRepository.findById(id)
            .orElseThrow(() -> new rw.gov.wasac.billing.exception.ResourceNotFoundException("Payment", id)));
    }

    public List<PaymentResponse> getPaymentsByBill(Long billId) {
        Bill bill = billService.findById(billId);
        return paymentRepository.findByBillOrderByCreatedAtDesc(bill)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PaymentResponse> getMyPayments(User user) {
        customerService.getActiveCustomerForUser(user); // throws if INACTIVE or no profile
        return paymentRepository.findByBill_Customer_User_IdOrderByCreatedAtDesc(user.getId())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
            .id(p.getId())
            .billId(p.getBill().getId())
            .billReference(p.getBill().getBillReference())
            .amountPaid(p.getAmountPaid())
            .paymentMethod(p.getPaymentMethod())
            .paymentDate(p.getPaymentDate())
            .referenceNumber(p.getReferenceNumber())
            .recordedByName(p.getRecordedBy().getFullNames())
            .createdAt(p.getCreatedAt())
            .build();
    }
}
