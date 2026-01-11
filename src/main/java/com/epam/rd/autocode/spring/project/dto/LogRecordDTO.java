package com.epam.rd.autocode.spring.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogRecordDTO {
    private Long id;
    private String category;
    private String level;
    private String message;
    private String username;
    private LocalDateTime timestamp;
}