package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.model.BookItem;
import com.epam.rd.autocode.spring.project.model.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

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

    public void sendOrderConfirmationEmail(String toEmail, Order order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Підтвердження замовлення #" + order.getId() + " - Book Store");

        StringBuilder sb = new StringBuilder();
        sb.append("Дякуємо за ваше замовлення, ").append(order.getClient().getName()).append("!\n\n");
        sb.append("Деталі замовлення:\n");
        sb.append("Номер: #").append(order.getId()).append("\n");
        sb.append("Дата: ").append(order.getOrderDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"))).append("\n");
        sb.append("Сума до сплати: ").append(order.getPrice()).append(" UAH\n\n");

        sb.append("Товари:\n");
        for (BookItem item : order.getBookItems()) {
            sb.append("- ").append(item.getBook().getName())
                    .append(" | ").append(item.getQuantity()).append(" шт.")
                    .append(" x ").append(item.getBook().getPrice()).append(" UAH\n");
        }

        if (order.getDeliveryCity() != null) {
            sb.append("\nДоставка:\n");
            sb.append("Місто: ").append(order.getDeliveryCity()).append("\n");
            sb.append("Відділення: ").append(order.getDeliveryBranch()).append("\n");
        }

        sb.append("\nМи вже готуємо ваше замовлення до відправки!\n");
        sb.append("\nЗ повагою,\nКоманда Book Store");

        message.setText(sb.toString());

        try {
            emailSender.send(message);
            System.out.println("Order confirmation email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}