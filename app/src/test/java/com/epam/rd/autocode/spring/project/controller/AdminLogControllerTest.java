package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.LogRecordDTO;
import com.epam.rd.autocode.spring.project.dto.LogStatsDTO;
import com.epam.rd.autocode.spring.project.service.LogService;
import com.epam.rd.autocode.spring.project.service.impl.I18nService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.epam.rd.autocode.spring.project.security.JwtService;
import com.epam.rd.autocode.spring.project.security.OAuth2LoginSuccessHandler;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.service.impl.RefreshTokenService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest(AdminLogController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminLogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LogService logService;

    @MockBean
    private I18nService i18nService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockBean
    private ClientRepository clientRepository;

    @MockBean
    private RefreshTokenService refreshTokenService;

    @Test
    void getAllLogs_ShouldReturnPagedLogs() throws Exception {
        LogRecordDTO logDTO = new LogRecordDTO();
        logDTO.setId(1L);
        logDTO.setCategory("SECURITY");
        logDTO.setLevel("INFO");
        logDTO.setMessage("User login");
        logDTO.setTimestamp(LocalDateTime.now());

        Page<LogRecordDTO> page = new PageImpl<>(List.of(logDTO), PageRequest.of(0, 10), 1);
        when(logService.searchLogs(anyString(), anyString(), anyString(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/admin/logs")
                .param("keyword", "login")
                .param("category", "SECURITY")
                .param("level", "INFO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].message").value("User login"));
    }

    @Test
    void getLogStats_ShouldReturnStats() throws Exception {
        LogStatsDTO stats = LogStatsDTO.builder()
                .categoryDistribution(java.util.Map.of("SECURITY", 50L, "BUSINESS", 30L))
                .levelDistribution(java.util.Map.of("INFO", 95L, "ERROR", 5L))
                .timeline(java.util.List.of())
                .build();
        when(logService.getStats()).thenReturn(stats);

        mockMvc.perform(get("/api/admin/logs/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryDistribution.SECURITY").value(50))
                .andExpect(jsonPath("$.levelDistribution.ERROR").value(5));
    }
}
