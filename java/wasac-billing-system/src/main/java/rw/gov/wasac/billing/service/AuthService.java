package rw.gov.wasac.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.*;
import rw.gov.wasac.billing.domain.enums.RoleName;
import rw.gov.wasac.billing.domain.enums.UserStatus;
import rw.gov.wasac.billing.domain.repository.*;
import rw.gov.wasac.billing.exception.DuplicateResourceException;
import rw.gov.wasac.billing.security.JwtTokenProvider;
import rw.gov.wasac.billing.web.dto.request.*;
import rw.gov.wasac.billing.web.dto.response.AuthResponse;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        if (customerRepository.existsByNationalId(request.getNationalId())) {
            throw new DuplicateResourceException("National ID already registered: " + request.getNationalId());
        }
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered as a customer: " + request.getEmail());
        }

        Role customerRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
            .orElseThrow(() -> new RuntimeException("ROLE_CUSTOMER not found. Ensure roles are seeded."));

        User user = User.builder()
            .fullNames(request.getFullNames())
            .email(request.getEmail())
            .phoneNumber(request.getPhoneNumber())
            .password(passwordEncoder.encode(request.getPassword()))
            .status(UserStatus.ACTIVE)
            .roles(Set.of(customerRole))
            .build();
        user = userRepository.save(user);

        Customer customer = Customer.builder()
            .fullNames(request.getFullNames())
            .nationalId(request.getNationalId())
            .email(request.getEmail())
            .phoneNumber(request.getPhoneNumber())
            .address(request.getAddress())
            .user(user)
            .build();
        customerRepository.save(customer);

        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        String token = jwtTokenProvider.generateToken(auth);
        return buildAuthResponse(user, token, UserStatus.ACTIVE);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        String token = jwtTokenProvider.generateToken(auth);
        User user = (User) auth.getPrincipal();
        UserStatus customerStatus = customerRepository.findByUser(user)
            .map(Customer::getStatus)
            .orElse(null);
        return buildAuthResponse(user, token, customerStatus);
    }

    private AuthResponse buildAuthResponse(User user, String token, UserStatus customerStatus) {
        List<String> roles = user.getRoles().stream()
            .map(r -> r.getName().name())
            .collect(Collectors.toList());
        return AuthResponse.builder()
            .accessToken(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .fullNames(user.getFullNames())
            .roles(roles)
            .customerStatus(customerStatus != null ? customerStatus.name() : null)
            .build();
    }
}
