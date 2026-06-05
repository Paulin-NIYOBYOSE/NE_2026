package rw.gov.wasac.billing.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import rw.gov.wasac.billing.domain.entity.Penalty;
import rw.gov.wasac.billing.service.PenaltyService;
import rw.gov.wasac.billing.web.dto.request.CreatePenaltyRequest;
import rw.gov.wasac.billing.web.dto.response.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/penalties")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Penalties", description = "Configure late payment penalties [ADMIN]")
public class PenaltyController {

    private final PenaltyService penaltyService;

    @Operation(summary = "Create penalty rule [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<Penalty>> create(@Valid @RequestBody CreatePenaltyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Penalty created", penaltyService.create(request)));
    }

    @Operation(summary = "Get all penalties [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Penalty>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(penaltyService.getAll()));
    }

    @Operation(summary = "Toggle active status [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Penalty>> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Toggled", penaltyService.toggleActive(id)));
    }
}
