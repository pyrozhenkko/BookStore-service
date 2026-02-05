package com.epam.rd.autocode.spring.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogStatsDTO {
    private Map<String, Long> categoryDistribution;
    private Map<String, Long> levelDistribution;
    private List<TimelinePoint> timeline;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TimelinePoint {
        private String date;
        private Long count;
    }
}
