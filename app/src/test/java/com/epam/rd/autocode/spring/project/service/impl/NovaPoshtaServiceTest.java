package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.delivery.NovaPoshtaDTOs.BranchDTO;
import com.epam.rd.autocode.spring.project.dto.delivery.NovaPoshtaDTOs.CityDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class NovaPoshtaServiceTest {

    private NovaPoshtaService novaPoshtaService;

    @Mock
    private RestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        novaPoshtaService = new NovaPoshtaService("http://api.test", "api-key");
        ReflectionTestUtils.setField(novaPoshtaService, "restTemplate", restTemplate);
    }

    @Test
    void searchCities_Success_ShouldReturnCities() {
        String json = "{\"success\": true, \"data\": [{\"Addresses\": [{\"DeliveryCity\": \"ref1\", \"Present\": \"Львів\"}]}]}";
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok(json));

        List<CityDTO> result = novaPoshtaService.searchCities("Львів");

        assertFalse(result.isEmpty());
        assertEquals("Львів", result.get(0).getDescription());
        assertEquals("ref1", result.get(0).getRef());
    }

    @Test
    void getBranches_Success_ShouldReturnBranches() {
        String json = "{\"success\": true, \"data\": [{\"Ref\": \"b_ref\", \"Description\": \"Відділення 1\", \"Number\": \"1\"}]}";
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok(json));

        List<BranchDTO> result = novaPoshtaService.getBranches("city_ref");

        assertFalse(result.isEmpty());
        assertEquals("Відділення 1", result.get(0).getDescription());
    }

    @Test
    void searchCities_Failure_ShouldReturnEmptyList() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"success\": false}"));

        List<CityDTO> result = novaPoshtaService.searchCities("Unknown");

        assertTrue(result.isEmpty());
    }
}
