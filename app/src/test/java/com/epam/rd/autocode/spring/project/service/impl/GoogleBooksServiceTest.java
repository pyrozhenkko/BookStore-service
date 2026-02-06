package com.epam.rd.autocode.spring.project.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class GoogleBooksServiceTest {

    @Mock
    private RestTemplate restTemplate;
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private GoogleBooksService googleBooksService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findImagesByTitle_Success_ShouldReturnImageUrl() throws Exception {
        String title = "Java";
        String response = "{\"items\": []}";
        JsonNode root = new ObjectMapper()
                .readTree("{\"items\": [{\"volumeInfo\": {\"imageLinks\": {\"thumbnail\": \"http://image.jpg\"}}}]}");

        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(response);
        when(objectMapper.readTree(response)).thenReturn(root);

        List<String> result = googleBooksService.findImagesByTitle(title);

        assertFalse(result.isEmpty());
        assertEquals("http://image.jpg", result.get(0));
    }

    @Test
    void findImagesByTitle_ApiError_ShouldReturnEmptyList() {
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenThrow(new RuntimeException("API Down"));

        List<String> result = googleBooksService.findImagesByTitle("Java");

        assertTrue(result.isEmpty());
    }
}
