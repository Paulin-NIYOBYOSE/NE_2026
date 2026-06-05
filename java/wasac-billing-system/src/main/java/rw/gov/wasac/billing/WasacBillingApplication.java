package rw.gov.wasac.billing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WasacBillingApplication {
    public static void main(String[] args) {
        SpringApplication.run(WasacBillingApplication.class, args);
    }
}
