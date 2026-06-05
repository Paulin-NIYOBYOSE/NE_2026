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
import rw.gov.wasac.billing.domain.enums.MeterType;
import rw.gov.wasac.billing.service.TariffService;
import rw.gov.wasac.billing.web.dto.request.CreateTariffRequest;
import rw.gov.wasac.billing.web.dto.response.*;

import java.util.List;

@RestController
@RequestMapping("/api/tariffs")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Tariff Configuration", description = "Configure consumption tariffs [ADMIN]")
public class TariffController {

    private final TariffService tariffService;

    @Operation(summary = "Create a new tariff (versioned) [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<TariffResponse>> create(
        @Valid @RequestBody CreateTariffRequest request, @AuthenticationPrincipal User admin) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Tariff created", tariffService.createTariff(request, admin)));
    }

    @Operation(summary = "Get all tariffs [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<TariffResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(tariffService.getAllTariffs()));
    }

    @Operation(summary = "Get tariff by ID [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TariffResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(tariffService.getTariffById(id)));
    }

    @Operation(summary = "Get current tariff for meter type [ADMIN, FINANCE]")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    @GetMapping("/current/{meterType}")
    public ResponseEntity<ApiResponse<TariffResponse>> getCurrent(@PathVariable MeterType meterType) {
        return ResponseEntity.ok(ApiResponse.ok(tariffService.getCurrentTariff(meterType)));
    }
}
