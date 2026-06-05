package rw.gov.wasac.billing.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import rw.gov.wasac.billing.domain.entity.ServiceCharge;
import rw.gov.wasac.billing.service.ServiceChargeService;
import rw.gov.wasac.billing.web.dto.request.CreateServiceChargeRequest;
import rw.gov.wasac.billing.web.dto.response.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/service-charges")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Service Charges", description = "Configure fixed service charges [ADMIN]")
public class ServiceChargeController {

    private final ServiceChargeService serviceChargeService;

    @Operation(summary = "Create service charge [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<ServiceCharge>> create(@Valid @RequestBody CreateServiceChargeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Service charge created", serviceChargeService.create(request)));
    }

    @Operation(summary = "Get all service charges [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceCharge>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(serviceChargeService.getAll()));
    }

    @Operation(summary = "Update service charge [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceCharge>> update(
        @PathVariable Long id, @Valid @RequestBody CreateServiceChargeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", serviceChargeService.update(id, request)));
    }

    @Operation(summary = "Toggle active status [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<ServiceCharge>> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Toggled", serviceChargeService.toggleActive(id)));
    }
}
