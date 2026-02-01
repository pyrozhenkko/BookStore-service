package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.delivery.NovaPoshtaDTOs.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NovaPoshtaService {

    @Value("${novaposhta.api.url}")
    private String apiUrl;

    @Value("${novaposhta.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<CityDTO> searchCities(String cityName) {
        Map<String, Object> properties = new HashMap<>();
        properties.put("CityName", cityName);
        properties.put("Limit", 20);

        NpRequest request = new NpRequest(apiKey, "Address", "searchSettlements", properties);
        return sendRequestAndParseCities(request);
    }

    public List<BranchDTO> getBranches(String cityRef) {
        System.out.println("--- NP DEBUG: Requesting branches for CityRef: '" + cityRef + "' ---");

        String cleanUrl = apiUrl.trim();
        if (!cleanUrl.endsWith("/")) {
            cleanUrl += "/";
        }
        System.out.println("--- NP DEBUG: Final Target URL: '" + cleanUrl + "'");

        Map<String, Object> properties = new HashMap<>();
        properties.put("CityRef", cityRef);
        properties.put("Language", "UA");

        NpRequest request = new NpRequest(apiKey, "Address", "getWarehouses", properties);
        return sendRequestAndParseBranches(request, cleanUrl);
    }


    private List<CityDTO> sendRequestAndParseCities(NpRequest request) {
        String cleanUrl = apiUrl.trim();
        if (!cleanUrl.endsWith("/")) {
            cleanUrl += "/";
        }

        List<CityDTO> result = new ArrayList<>();

        try {
            HttpEntity<NpRequest> entity = createEntity(request);

            ResponseEntity<String> responseEntity = restTemplate.postForEntity(cleanUrl, entity, String.class);
            String rawJson = responseEntity.getBody();

            if (rawJson == null) return result;

            if (rawJson.trim().startsWith("<")) {
                System.err.println("--- NP ERROR: Received HTML instead of JSON. URL might be wrong.");
                System.err.println("--- NP RESPONSE START: " + rawJson.substring(0, Math.min(rawJson.length(), 200)));
                return result;
            }

            JsonNode response = objectMapper.readTree(rawJson);
            if (response != null && response.get("success").asBoolean()) {
                JsonNode data = response.get("data");
                if (data.isArray() && data.size() > 0) {
                    JsonNode addresses = data.get(0).get("Addresses");
                    if (addresses != null) {
                        for (JsonNode node : addresses) {
                            String ref = node.get("DeliveryCity").asText();
                            String name = node.get("Present").asText();
                            if (!ref.isEmpty()) {
                                result.add(new CityDTO(ref, name, ""));
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    private List<BranchDTO> sendRequestAndParseBranches(NpRequest request, String url) {
        List<BranchDTO> result = new ArrayList<>();
        try {
            HttpEntity<NpRequest> entity = createEntity(request);

            ResponseEntity<String> responseEntity = restTemplate.postForEntity(url, entity, String.class);

            System.out.println("--- NP STATUS: " + responseEntity.getStatusCode());
            String rawJson = responseEntity.getBody();

            if (rawJson == null) {
                System.err.println("--- NP ERROR: Body is NULL! ---");
                return result;
            }

            if (rawJson.trim().startsWith("<")) {
                System.err.println("--- NP ERROR: Received HTML response (Redirect or Error Page).");
                System.err.println("--- NP HTML BODY: " + rawJson);
                return result;
            }

            JsonNode response = objectMapper.readTree(rawJson);

            if (response != null && response.has("success") && response.get("success").asBoolean()) {
                JsonNode data = response.get("data");
                System.out.println("--- NP SUCCESS: Found " + data.size() + " branches.");

                if (data.isArray()) {
                    for (JsonNode node : data) {
                        result.add(new BranchDTO(
                                node.get("Ref").asText(),
                                node.get("Description").asText(),
                                node.get("Number").asText()
                        ));
                    }
                }
            } else {
                if (response != null) {
                    System.err.println("--- NP API ERROR: " + response.get("errors"));
                }
            }
        } catch (Exception e) {
            System.err.println("--- NP EXCEPTION: " + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    private HttpEntity<NpRequest> createEntity(NpRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("User-Agent", "Java-Spring-Client/1.0");
        headers.add("Accept", "application/json");
        return new HttpEntity<>(request, headers);
    }
}