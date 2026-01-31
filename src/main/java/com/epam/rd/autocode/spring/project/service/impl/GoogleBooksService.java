package com.epam.rd.autocode.spring.project.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoogleBooksService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String GOOGLE_API_URL = "https://www.googleapis.com/books/v1/volumes?q=intitle:";

    public List<String> findImagesByTitle(String title) {
        List<String> images = new ArrayList<>();
        try {
            String url = GOOGLE_API_URL + title.replace(" ", "+") + "&maxResults=1";
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);

            if (root.has("items") && root.get("items").isArray()) {
                JsonNode volumeInfo = root.get("items").get(0).get("volumeInfo");
                if (volumeInfo.has("imageLinks")) {
                    JsonNode links = volumeInfo.get("imageLinks");

                    // вибір якості
                    if (links.has("extraLarge")) images.add(links.get("extraLarge").asText());
                    else if (links.has("large")) images.add(links.get("large").asText());
                    else if (links.has("thumbnail")) images.add(links.get("thumbnail").asText());
                }
            }
        } catch (Exception e) {
            System.err.println("Google Books API Error: " + e.getMessage());
        }

        return images;
    }
}