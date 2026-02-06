package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.delivery.NovaPoshtaDTOs.BranchDTO;
import com.epam.rd.autocode.spring.project.dto.delivery.NovaPoshtaDTOs.CityDTO;
import com.epam.rd.autocode.spring.project.service.impl.NovaPoshtaService;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.security.JwtService;
import com.epam.rd.autocode.spring.project.security.OAuth2LoginSuccessHandler;
import com.epam.rd.autocode.spring.project.service.impl.I18nService;
import com.epam.rd.autocode.spring.project.service.impl.RefreshTokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest(DeliveryController.class)
@AutoConfigureMockMvc(addFilters = false)
class DeliveryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NovaPoshtaService novaPoshtaService;

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
    void searchCities_ShouldReturnCities() throws Exception {
        CityDTO city = new CityDTO();
        city.setDescription("Львів");
        city.setArea("Львівська обл.");

        when(novaPoshtaService.searchCities(anyString())).thenReturn(List.of(city));

        mockMvc.perform(get("/api/delivery/cities").param("name", "Льв"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].description").value("Львів"));
    }

    @Test
    void getBranches_ShouldReturnBranches() throws Exception {
        BranchDTO branch = new BranchDTO();
        branch.setDescription("Відділення №1");

        when(novaPoshtaService.getBranches(anyString())).thenReturn(List.of(branch));

        mockMvc.perform(get("/api/delivery/branches").param("cityRef", "ref"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].description").value("Відділення №1"));
    }
}
