package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.LogRecordDTO;
import com.epam.rd.autocode.spring.project.dto.LogStatsDTO;
import com.epam.rd.autocode.spring.project.mapper.LogRecordMapper;
import com.epam.rd.autocode.spring.project.model.LogRecord;
import com.epam.rd.autocode.spring.project.repo.LogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LogServiceImplTest {

    @Mock
    private LogRepository logRepository;
    @Mock
    private LogRecordMapper logRecordMapper;

    @InjectMocks
    private LogServiceImpl logService;

    private LogRecord logRecord;
    private LogRecordDTO logRecordDTO;

    @BeforeEach
    void setUp() {
        logRecord = new LogRecord();
        logRecord.setId(1L);
        logRecord.setCategory("AUTH");
        logRecord.setLevel("INFO");
        logRecord.setTimestamp(LocalDateTime.now());

        logRecordDTO = new LogRecordDTO();
        logRecordDTO.setCategory("AUTH");
        logRecordDTO.setLevel("INFO");
    }

    @Test
    void searchLogs_ShouldReturnPage() {
        Pageable pageable = Pageable.unpaged();
        when(logRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(Collections.singletonList(logRecord)));
        when(logRecordMapper.toDto(logRecord)).thenReturn(logRecordDTO);

        Page<LogRecordDTO> result = logService.searchLogs("keyword", "AUTH", "INFO", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getStats_ShouldCalculateCorrectly() {
        LogRecord log1 = new LogRecord();
        log1.setCategory("AUTH");
        log1.setLevel("INFO");
        log1.setTimestamp(LocalDateTime.of(2023, 10, 1, 10, 0));

        LogRecord log2 = new LogRecord();
        log2.setCategory("DATABASE");
        log2.setLevel("ERROR");
        log2.setTimestamp(LocalDateTime.of(2023, 10, 1, 11, 0));

        LogRecord log3 = new LogRecord();
        log3.setCategory("AUTH");
        log3.setLevel("INFO");
        log3.setTimestamp(LocalDateTime.of(2023, 10, 2, 10, 0));

        List<LogRecord> logs = Arrays.asList(log1, log2, log3);
        when(logRepository.findAll()).thenReturn(logs);

        LogStatsDTO stats = logService.getStats();

        assertNotNull(stats);
        assertEquals(2, stats.getCategoryDistribution().get("AUTH"));
        assertEquals(1, stats.getCategoryDistribution().get("DATABASE"));
        assertEquals(2, stats.getLevelDistribution().get("INFO"));
        assertEquals(1, stats.getLevelDistribution().get("ERROR"));
        assertEquals(2, stats.getTimeline().size());
        assertEquals(2L, stats.getTimeline().get(0).getCount()); // 2023-10-01 has 2 logs
        assertEquals(1L, stats.getTimeline().get(1).getCount()); // 2023-10-02 has 1 log
    }
}
