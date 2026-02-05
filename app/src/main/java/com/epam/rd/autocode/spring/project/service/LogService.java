package com.epam.rd.autocode.spring.project.service;

import com.epam.rd.autocode.spring.project.dto.LogRecordDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;

public interface LogService {

    @PreAuthorize("hasRole('ADMIN')")
    Page<LogRecordDTO> searchLogs(String keyword, String category, String level, Pageable pageable);

    @PreAuthorize("hasRole('ADMIN')")
    com.epam.rd.autocode.spring.project.dto.LogStatsDTO getStats();
}