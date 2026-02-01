package com.epam.rd.autocode.spring.project.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${client.url}")
    private String clientUrl;

    public void sendPasswordResetEmail(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Відновлення пароля - Book Store");

        String resetUrl = clientUrl + "/reset-password?token=" + token;

        String text = String.format(
                "Вітаємо!\n\n" +
                        "Ви (або хтось інший) подали запит на відновлення пароля для вашого акаунту.\n" +
                        "Щоб встановити новий пароль, перейдіть за посиланням:\n\n" +
                        "%s\n\n" +
                        "Якщо ви не робили цього запиту, просто проігноруйте цей лист.\n\n" +
                        "З повагою,\nКоманда Book Store",
                resetUrl
        );

        message.setText(text);
        emailSender.send(message);
        System.out.println("Email sent successfully to " + toEmail);
    }
}