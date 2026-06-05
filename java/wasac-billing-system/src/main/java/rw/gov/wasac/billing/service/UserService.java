package rw.gov.wasac.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.*;
import rw.gov.wasac.billing.domain.enums.*;
import rw.gov.wasac.billing.domain.repository.*;
import rw.gov.wasac.billing.exception.*;
import rw.gov.wasac.billing.web.dto.request.*;
import rw.gov.wasac.billing.web.dto.response.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RoleRequestRepository roleRequestRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        Role role = roleRepository.findByName(request.getRole())
            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));

        User user = User.builder()
            .fullNames(request.getFullNames())
            .email(request.getEmail())
            .phoneNumber(request.getPhoneNumber())
            .password(passwordEncoder.encode(request.getPassword()))
            .status(UserStatus.ACTIVE)
            .roles(new HashSet<>(Set.of(role)))
            .build();
        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findById(id);
        user.setFullNames(request.getFullNames());
        user.setPhoneNumber(request.getPhoneNumber());
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void activateUser(Long id) {
        User user = findById(id);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public void deactivateUser(Long id) {
        User user = findById(id);
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.delete(findById(id));
    }

    @Transactional
    public UserResponse assignRole(Long userId, AssignRoleRequest request) {
        User user = findById(userId);
        Role role = roleRepository.findByName(request.getRole())
            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));
        user.getRoles().clear();
        user.getRoles().add(role);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void submitRoleRequest(User requester, RoleRequestDto dto) {
        if (roleRequestRepository.existsByUserAndStatus(requester, RoleRequestStatus.PENDING)) {
            throw new BusinessException("You already have a pending role request");
        }
        RoleRequest rr = RoleRequest.builder()
            .user(requester)
            .requestedRole(dto.getRequestedRole())
            .status(RoleRequestStatus.PENDING)
            .build();
        roleRequestRepository.save(rr);
    }

    public List<RoleRequest> getAllRoleRequests() {
        return roleRequestRepository.findAll();
    }

    public List<RoleRequest> getPendingRoleRequests() {
        return roleRequestRepository.findByStatus(RoleRequestStatus.PENDING);
    }

    @Transactional
    public void approveRoleRequest(Long requestId, User admin) {
        RoleRequest rr = roleRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("RoleRequest", requestId));
        if (rr.getStatus() != RoleRequestStatus.PENDING) {
            throw new BusinessException("Request is not in PENDING state");
        }
        Role role = roleRepository.findByName(rr.getRequestedRole())
            .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        User user = rr.getUser();
        user.getRoles().clear();
        user.getRoles().add(role);
        userRepository.save(user);

        rr.setStatus(RoleRequestStatus.APPROVED);
        rr.setReviewedAt(LocalDateTime.now());
        rr.setReviewedBy(admin);
        roleRequestRepository.save(rr);
    }

    @Transactional
    public void rejectRoleRequest(Long requestId, User admin) {
        RoleRequest rr = roleRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("RoleRequest", requestId));
        if (rr.getStatus() != RoleRequestStatus.PENDING) {
            throw new BusinessException("Request is not in PENDING state");
        }
        rr.setStatus(RoleRequestStatus.REJECTED);
        rr.setReviewedAt(LocalDateTime.now());
        rr.setReviewedBy(admin);
        roleRequestRepository.save(rr);
    }

    private User findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    public UserResponse toResponse(User user) {
        List<String> roles = user.getRoles().stream()
            .map(r -> r.getName().name()).collect(Collectors.toList());
        return UserResponse.builder()
            .id(user.getId())
            .fullNames(user.getFullNames())
            .email(user.getEmail())
            .phoneNumber(user.getPhoneNumber())
            .status(user.getStatus())
            .roles(roles)
            .createdAt(user.getCreatedAt())
            .build();
    }
}
