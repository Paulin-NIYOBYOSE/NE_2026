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
import rw.gov.wasac.billing.service.MeterReadingService;
import rw.gov.wasac.billing.web.dto.request.CreateMeterReadingRequest;
import rw.gov.wasac.billing.web.dto.response.*;

import java.util.List;

@RestController
@RequestMapping("/api/meter-readings")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Meter Readings", description = "Capture and view meter readings [OPERATOR]")
public class MeterReadingController {

    private final MeterReadingService meterReadingService;

    @Operation(summary = "Capture a meter reading [OPERATOR]")
    @PreAuthorize("hasRole('OPERATOR')")
    @PostMapping
    public ResponseEntity<ApiResponse<MeterReadingResponse>> capture(
        @Valid @RequestBody CreateMeterReadingRequest request,
        @AuthenticationPrincipal User operator) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Meter reading captured", meterReadingService.captureReading(request, operator)));
    }

    @Operation(summary = "Get all meter readings [ADMIN, OPERATOR]")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<MeterReadingResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(meterReadingService.getAllReadings()));
    }

    @Operation(summary = "Get meter reading by ID [ADMIN, OPERATOR]")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MeterReadingResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(meterReadingService.getReadingById(id)));
    }

    @Operation(summary = "Get readings by meter [ADMIN, OPERATOR]")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    @GetMapping("/meter/{meterId}")
    public ResponseEntity<ApiResponse<List<MeterReadingResponse>>> getByMeter(@PathVariable Long meterId) {
        return ResponseEntity.ok(ApiResponse.ok(meterReadingService.getReadingsByMeter(meterId)));
    }
}
