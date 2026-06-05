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
import rw.gov.wasac.billing.service.BillService;
import rw.gov.wasac.billing.web.dto.request.GenerateBillRequest;
import rw.gov.wasac.billing.web.dto.response.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Billing", description = "Generate and manage utility bills")
public class BillController {

    private final BillService billService;

    @Operation(summary = "Generate a bill from a meter reading [ADMIN, FINANCE]")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<BillResponse>> generate(
        @Valid @RequestBody GenerateBillRequest request, @AuthenticationPrincipal User actor) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Bill generated successfully", billService.generateBill(request, actor)));
    }

    @Operation(summary = "Get all bills [ADMIN, FINANCE]")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<BillResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(billService.getAllBills()));
    }

    @Operation(summary = "Get bill by ID [ADMIN, FINANCE]")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BillResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(billService.getBillById(id)));
    }

    @Operation(summary = "Get bills by customer ID [ADMIN, FINANCE]")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.ok(billService.getBillsByCustomer(customerId)));
    }

    @Operation(summary = "View own bills [CUSTOMER]")
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getMyBills(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(billService.getMyBills(user)));
    }

    @Operation(summary = "Approve a bill [ADMIN, FINANCE]")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<BillResponse>> approve(
        @PathVariable Long id, @AuthenticationPrincipal User actor) {
        return ResponseEntity.ok(ApiResponse.ok("Bill approved", billService.approveBill(id, actor)));
    }

    @Operation(summary = "Reject a bill [ADMIN, FINANCE]")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<BillResponse>> reject(
        @PathVariable Long id, @AuthenticationPrincipal User actor) {
        return ResponseEntity.ok(ApiResponse.ok("Bill rejected", billService.rejectBill(id, actor)));
    }
}
