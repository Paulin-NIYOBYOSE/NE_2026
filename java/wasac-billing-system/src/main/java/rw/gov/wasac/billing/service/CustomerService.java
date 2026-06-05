package rw.gov.wasac.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.Customer;
import rw.gov.wasac.billing.domain.entity.User;
import rw.gov.wasac.billing.domain.enums.UserStatus;
import rw.gov.wasac.billing.domain.repository.CustomerRepository;
import rw.gov.wasac.billing.domain.repository.UserRepository;
import rw.gov.wasac.billing.exception.*;
import rw.gov.wasac.billing.web.dto.request.*;
import rw.gov.wasac.billing.web.dto.response.CustomerResponse;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        if (customerRepository.existsByNationalId(request.getNationalId())) {
            throw new DuplicateResourceException("Customer with National ID already exists: " + request.getNationalId());
        }
        Customer customer = Customer.builder()
            .fullNames(request.getFullNames())
            .nationalId(request.getNationalId())
            .email(request.getEmail())
            .phoneNumber(request.getPhoneNumber())
            .address(request.getAddress())
            .status(UserStatus.ACTIVE)
            .build();

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));
            customer.setUser(user);
        }
        return toResponse(customerRepository.save(customer));
    }

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CustomerResponse getCustomerById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, UpdateCustomerRequest request) {
        Customer customer = findById(id);
        customer.setFullNames(request.getFullNames());
        customer.setEmail(request.getEmail());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setAddress(request.getAddress());
        if (request.getStatus() != null) customer.setStatus(request.getStatus());
        return toResponse(customerRepository.save(customer));
    }

    @Transactional
    public void deactivateCustomer(Long id) {
        Customer customer = findById(id);
        customer.setStatus(UserStatus.INACTIVE);
        customerRepository.save(customer);
    }

    public Customer findById(Long id) {
        return customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
    }

    public CustomerResponse toResponse(Customer c) {
        return CustomerResponse.builder()
            .id(c.getId())
            .fullNames(c.getFullNames())
            .nationalId(c.getNationalId())
            .email(c.getEmail())
            .phoneNumber(c.getPhoneNumber())
            .address(c.getAddress())
            .status(c.getStatus())
            .linkedUserId(c.getUser() != null ? c.getUser().getId() : null)
            .createdAt(c.getCreatedAt())
            .build();
    }
}
