package rw.gov.wasac.billing.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import rw.gov.wasac.billing.domain.entity.User;
import rw.gov.wasac.billing.service.NotificationService;
import rw.gov.wasac.billing.web.dto.response.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Notifications", description = "View system notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Get all notifications system-wide [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getAllNotifications()));
    }

    @Operation(summary = "Get own notifications [CUSTOMER]")
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMy(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getMyNotifications(user)));
    }

    @Operation(summary = "Mark notification as read [CUSTOMER]")
    @PreAuthorize("hasRole('CUSTOMER')")
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markRead(
        @PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Marked as read", notificationService.markAsRead(id, user)));
    }

    @Operation(summary = "Count unread notifications [CUSTOMER]")
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/my/unread-count")
    public ResponseEntity<ApiResponse<Long>> unreadCount(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.countUnread(user)));
    }
}
