package com.epam.rd.autocode.spring.project.dto.delivery;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class NovaPoshtaDTOs {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CityDTO {
        private String ref;          // Унікальний ID міста в системі НП (36-символьний UUID)
        private String description;  // Назва міста
        private String area;         // Область
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BranchDTO {
        private String ref;          // Унікальний ID відділення
        private String description;  // (напр. "Відділення №1: вул. ...")
        private String number;       // Номер відділення
    }

    // Клас для формування тіла запиту до НП
    @Data
    @AllArgsConstructor
    public static class NpRequest {
        private String apiKey;
        private String modelName;
        private String calledMethod;
        private java.util.Map<String, Object> methodProperties;
    }
}