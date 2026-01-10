package com.epam.rd.autocode.spring.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "log_records")
public class LogRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String level;

    @Column(length = 2000)
    private String message;
    // хто викликав подію
    private String username;

    private LocalDateTime timestamp;

    public LogRecord(String category, String level, String message, String username) {
        this.category = category;
        this.level = level;
        this.message = message;
        this.username = username;
        this.timestamp = LocalDateTime.now();
    }
}