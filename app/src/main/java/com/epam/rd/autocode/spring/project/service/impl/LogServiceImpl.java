package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.LogRecordDTO;
import com.epam.rd.autocode.spring.project.mapper.LogRecordMapper;
import com.epam.rd.autocode.spring.project.model.LogRecord;
import com.epam.rd.autocode.spring.project.repo.LogRepository;
import com.epam.rd.autocode.spring.project.repo.specification.LogSpecification;
import com.epam.rd.autocode.spring.project.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LogServiceImpl implements LogService {

    private final LogRepository logRepository;
    private final LogRecordMapper logRecordMapper;

    @Override
    public Page<LogRecordDTO> searchLogs(String keyword, String category, String level, Pageable pageable) {
        Specification<LogRecord> spec = Specification.where(LogSpecification.hasKeyword(keyword))
                .and(LogSpecification.hasCategory(category))
                .and(LogSpecification.hasLevel(level));

        return logRepository.findAll(spec, pageable)
                .map(logRecordMapper::toDto);
    }
}