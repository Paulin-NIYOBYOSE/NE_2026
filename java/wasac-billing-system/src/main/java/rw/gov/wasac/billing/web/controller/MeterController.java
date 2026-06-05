package rw.gov.wasac.billing.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import rw.gov.wasac.billing.service.MeterService;
import rw.gov.wasac.billing.web.dto.request.CreateMeterRequest;
import rw.gov.wasac.billing.web.dto.response.*;

import java.util.List;

@RestController
@RequestMapping("/api/meters")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Meter Management", description = "Manage utility meters [ADMIN]")
public class MeterController {

    private final MeterService meterService;

    @Operation(summary = "Create and assign a meter [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<MeterResponse>> create(@Valid @RequestBody CreateMeterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Meter created", meterService.createMeter(request)));
    }

    @Operation(summary = "Get all meters [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<MeterResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(meterService.getAllMeters()));
    }

    @Operation(summary = "Get meter by ID [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MeterResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(meterService.getMeterById(id)));
    }

    @Operation(summary = "Get meters by customer [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<MeterResponse>>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.ok(meterService.getMetersByCustomer(customerId)));
    }

    @Operation(summary = "Activate meter [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activate(@PathVariable Long id) {
        meterService.activateMeter(id);
        return ResponseEntity.ok(ApiResponse.ok("Meter activated", null));
    }

    @Operation(summary = "Deactivate meter [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        meterService.deactivateMeter(id);
        return ResponseEntity.ok(ApiResponse.ok("Meter deactivated", null));
    }
}
