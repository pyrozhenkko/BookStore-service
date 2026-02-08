package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.delivery.NovaPoshtaDTOs.*;
import com.epam.rd.autocode.spring.project.service.impl.NovaPoshtaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final NovaPoshtaService novaPoshtaService;

    // Пошук міста (вводжу "Льв" -> отримую список міст)
    // GET /api/delivery/cities?name=Льв
    @GetMapping("/cities")
    public ResponseEntity<List<CityDTO>> searchCities(@RequestParam("name") String name) {
        return ResponseEntity.ok(novaPoshtaService.searchCities(name));
    }

    // Отримання відділень (вибрав місто -> відправив його Ref -> отримав список
    // відділень)
    // GET /api/delivery/branches?cityRef=8d5a980d-391c-11dd-90d9-001a92567626
    @GetMapping("/branches")
    public ResponseEntity<List<BranchDTO>> getBranches(@RequestParam("cityRef") String cityRef) {
        return ResponseEntity.ok(novaPoshtaService.getBranches(cityRef));
    }
}