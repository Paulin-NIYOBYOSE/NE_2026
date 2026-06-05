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
import rw.gov.wasac.billing.domain.entity.*;
import rw.gov.wasac.billing.service.UserService;
import rw.gov.wasac.billing.web.dto.request.*;
import rw.gov.wasac.billing.web.dto.response.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "User Management", description = "Admin-controlled user management and role operations")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Create a user with a specific role [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("User created successfully", userService.createUser(request)));
    }

    @Operation(summary = "Get all users [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @Operation(summary = "Get user by ID [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
    }

    @Operation(summary = "Update user [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
        @PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("User updated", userService.updateUser(id, request)));
    }

    @Operation(summary = "Activate user [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long id) {
        userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User activated", null));
    }

    @Operation(summary = "Deactivate user [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User deactivated", null));
    }

    @Operation(summary = "Delete user [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted", null));
    }

    @Operation(summary = "Directly assign/change role [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> assignRole(
        @PathVariable Long id, @Valid @RequestBody AssignRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Role assigned", userService.assignRole(id, request)));
    }

    @Operation(summary = "Get all role upgrade requests [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/role-requests")
    public ResponseEntity<ApiResponse<List<RoleRequest>>> getRoleRequests() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllRoleRequests()));
    }

    @Operation(summary = "Get pending role upgrade requests [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/role-requests/pending")
    public ResponseEntity<ApiResponse<List<RoleRequest>>> getPendingRoleRequests() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getPendingRoleRequests()));
    }

    @Operation(summary = "Approve a role request [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/role-requests/{requestId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveRoleRequest(
        @PathVariable Long requestId, @AuthenticationPrincipal User admin) {
        userService.approveRoleRequest(requestId, admin);
        return ResponseEntity.ok(ApiResponse.ok("Role request approved", null));
    }

    @Operation(summary = "Reject a role request [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/role-requests/{requestId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectRoleRequest(
        @PathVariable Long requestId, @AuthenticationPrincipal User admin) {
        userService.rejectRoleRequest(requestId, admin);
        return ResponseEntity.ok(ApiResponse.ok("Role request rejected", null));
    }

    @Operation(summary = "Submit a role upgrade request [CUSTOMER]")
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/role-requests")
    public ResponseEntity<ApiResponse<Void>> submitRoleRequest(
        @Valid @RequestBody RoleRequestDto dto, @AuthenticationPrincipal User user) {
        userService.submitRoleRequest(user, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Role request submitted. Awaiting admin approval.", null));
    }
}
