package rw.gov.wasac.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.*;
import rw.gov.wasac.billing.domain.repository.*;
import rw.gov.wasac.billing.exception.ResourceNotFoundException;
import rw.gov.wasac.billing.web.dto.response.NotificationResponse;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CustomerRepository customerRepository;

    public List<NotificationResponse> getMyNotifications(User user) {
        Customer customer = customerRepository.findByUser(user)
            .orElseThrow(() -> new ResourceNotFoundException("No customer profile linked to your account"));
        return notificationRepository.findByCustomerOrderByCreatedAtDesc(customer)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, User user) {
        Notification notif = notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        Customer customer = customerRepository.findByUser(user)
            .orElseThrow(() -> new ResourceNotFoundException("No customer profile linked to your account"));
        if (!notif.getCustomer().getId().equals(customer.getId())) {
            throw new rw.gov.wasac.billing.exception.BusinessException("You can only mark your own notifications as read");
        }
        notif.setIsRead(true);
        return toResponse(notificationRepository.save(notif));
    }

    public List<NotificationResponse> getAllNotifications() {
        return notificationRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long countUnread(User user) {
        Customer customer = customerRepository.findByUser(user)
            .orElse(null);
        if (customer == null) return 0;
        return notificationRepository.countByCustomerAndIsReadFalse(customer);
    }

    public NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId())
            .customerId(n.getCustomer().getId())
            .message(n.getMessage())
            .notificationType(n.getNotificationType())
            .isRead(n.getIsRead())
            .createdAt(n.getCreatedAt())
            .build();
    }
}
