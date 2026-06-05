package rw.gov.wasac.billing.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import rw.gov.wasac.billing.domain.entity.User;
import rw.gov.wasac.billing.service.PaymentService;
import rw.gov.wasac.billing.web.dto.request.RecordPaymentRequest;
import rw.gov.wasac.billing.web.dto.response.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Payments", description = "Record and view customer payments")
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Record a payment [FINANCE]")
    @PreAuthorize("hasRole('FINANCE')")
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> record(
        @Valid @RequestBody RecordPaymentRequest request, @AuthenticationPrincipal User finance) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Payment recorded", paymentService.recordPayment(request, finance)));
    }

    @Operation(summary = "Get all payments [ADMIN, FINANCE]")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getAllPayments()));
    }

    @Operation(summary = "Get payment by ID [ADMIN, FINANCE]")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getPaymentById(id)));
    }

    @Operation(summary = "Get payments by bill ID [ADMIN, FINANCE]")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    @GetMapping("/bill/{billId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getByBill(@PathVariable Long billId) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getPaymentsByBill(billId)));
    }

    @Operation(summary = "View own payment history [CUSTOMER]")
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getMyPayments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getMyPayments(user)));
    }
}
