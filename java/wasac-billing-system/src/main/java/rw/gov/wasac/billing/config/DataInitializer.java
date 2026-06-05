package rw.gov.wasac.billing.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import rw.gov.wasac.billing.domain.entity.Role;
import rw.gov.wasac.billing.domain.entity.User;
import rw.gov.wasac.billing.domain.enums.RoleName;
import rw.gov.wasac.billing.domain.enums.UserStatus;
import rw.gov.wasac.billing.domain.repository.RoleRepository;
import rw.gov.wasac.billing.domain.repository.UserRepository;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedRoles();
        seedAdmin();
    }

    private void seedRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(Role.builder().name(roleName).build());
                log.info("Seeded role: {}", roleName);
            }
        }
    }

    private void seedAdmin() {
        String adminEmail = "admin@wasac.rw";
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin user already exists, skipping seed.");
            return;
        }
        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
            .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found after seeding"));

        User admin = User.builder()
            .fullNames("System Administrator")
            .email(adminEmail)
            .phoneNumber("+250788000000")
            .password(passwordEncoder.encode("Admin@1234"))
            .status(UserStatus.ACTIVE)
            .roles(Set.of(adminRole))
            .build();
        userRepository.save(admin);
        log.info("=================================================");
        log.info("Admin seeded: {} / Admin@1234", adminEmail);
        log.info("=================================================");
    }
}
