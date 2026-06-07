package rw.gov.wasac.billing.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Async
    public void send(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {}: {}", toEmail, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    public static String buildHtml(String customerName, String body) {
        return """
            <html><body style="font-family:Arial,sans-serif;color:#222;max-width:600px;margin:auto">
              <div style="background:#006B3C;padding:20px 30px">
                <h2 style="color:#fff;margin:0">WASAC Billing System</h2>
              </div>
              <div style="padding:24px 30px;border:1px solid #ddd;border-top:none">
                <p>Dear <strong>%s</strong>,</p>
                %s
                <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
                <p style="color:#888;font-size:12px">
                  This is an automated message from the WASAC Billing System.<br/>
                  Please do not reply to this email.
                </p>
              </div>
            </body></html>
            """.formatted(customerName, body);
    }
}
