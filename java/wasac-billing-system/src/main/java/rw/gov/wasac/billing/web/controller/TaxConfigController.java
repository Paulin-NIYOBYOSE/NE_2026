package rw.gov.wasac.billing.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import rw.gov.wasac.billing.domain.entity.TaxConfig;
import rw.gov.wasac.billing.service.TaxConfigService;
import rw.gov.wasac.billing.web.dto.request.CreateTaxConfigRequest;
import rw.gov.wasac.billing.web.dto.response.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/tax-configs")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Tax Configuration", description = "Configure VAT and other taxes [ADMIN]")
public class TaxConfigController {

    private final TaxConfigService taxConfigService;

    @Operation(summary = "Create tax configuration [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<TaxConfig>> create(@Valid @RequestBody CreateTaxConfigRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Tax config created", taxConfigService.createTaxConfig(request)));
    }

    @Operation(summary = "Get all tax configurations [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<TaxConfig>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(taxConfigService.getAllTaxConfigs()));
    }

    @Operation(summary = "Update tax configuration [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxConfig>> update(
        @PathVariable Long id, @Valid @RequestBody CreateTaxConfigRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Tax config updated", taxConfigService.update(id, request)));
    }

    @Operation(summary = "Toggle active status of tax config [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<TaxConfig>> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Tax config status toggled", taxConfigService.toggleActive(id)));
    }
}
