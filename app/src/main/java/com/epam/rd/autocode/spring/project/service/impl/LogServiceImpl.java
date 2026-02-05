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

    @Override
    public com.epam.rd.autocode.spring.project.dto.LogStatsDTO getStats() {
        java.util.List<LogRecord> allLogs = logRepository.findAll();

        java.util.Map<String, Long> categoryDistribution = allLogs.stream()
                .collect(java.util.stream.Collectors.groupingBy(LogRecord::getCategory,
                        java.util.stream.Collectors.counting()));

        java.util.Map<String, Long> levelDistribution = allLogs.stream()
                .collect(java.util.stream.Collectors.groupingBy(LogRecord::getLevel,
                        java.util.stream.Collectors.counting()));

        java.util.Map<String, Long> timelineMap = allLogs.stream()
                .filter(log -> log.getTimestamp() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        log -> log.getTimestamp().toLocalDate().toString(),
                        java.util.stream.Collectors.counting()));

        java.util.List<com.epam.rd.autocode.spring.project.dto.LogStatsDTO.TimelinePoint> timeline = timelineMap
                .entrySet().stream()
                .map(e -> new com.epam.rd.autocode.spring.project.dto.LogStatsDTO.TimelinePoint(e.getKey(),
                        e.getValue()))
                .sorted(java.util.Comparator
                        .comparing(com.epam.rd.autocode.spring.project.dto.LogStatsDTO.TimelinePoint::getDate))
                .collect(java.util.stream.Collectors.toList());

        return com.epam.rd.autocode.spring.project.dto.LogStatsDTO.builder()
                .categoryDistribution(categoryDistribution)
                .levelDistribution(levelDistribution)
                .timeline(timeline)
                .build();
    }
}