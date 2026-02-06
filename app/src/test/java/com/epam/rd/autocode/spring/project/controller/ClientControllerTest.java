package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.ClientDTO;
import com.epam.rd.autocode.spring.project.dto.favorite.FavoriteDTOs.FavoriteItemDTO;
import com.epam.rd.autocode.spring.project.dto.favorite.FavoriteDTOs.FavoriteRequest;
import com.epam.rd.autocode.spring.project.service.ClientService;
import com.epam.rd.autocode.spring.project.service.impl.I18nService;
import com.epam.rd.autocode.spring.project.service.impl.RefreshTokenService;
import com.epam.rd.autocode.spring.project.security.JwtService;
import com.epam.rd.autocode.spring.project.security.OAuth2LoginSuccessHandler;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest(ClientController.class)
@AutoConfigureMockMvc(addFilters = false)
class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClientService clientService;

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
    void addToFavorites_ShouldReturnOk() throws Exception {
        FavoriteRequest request = new FavoriteRequest();
        request.setBookId(1L);
        doNothing().when(clientService).addBookToFavorites(any(FavoriteRequest.class));

        mockMvc.perform(post("/api/clients/favorites")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void getMyFavorites_ShouldReturnList() throws Exception {
        FavoriteItemDTO item = new FavoriteItemDTO();
        item.setId(1L);
        when(clientService.getMyFavorites()).thenReturn(List.of(item));

        mockMvc.perform(get("/api/clients/favorites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void searchClients_ShouldReturnPagedClients() throws Exception {
        ClientDTO client = new ClientDTO();
        client.setId(1L);
        client.setEmail("test@client.com");
        Page<ClientDTO> page = new PageImpl<>(List.of(client), PageRequest.of(0, 10), 1);

        when(clientService.searchClients(anyString(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/clients/search").param("keyword", "test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].email").value("test@client.com"));
    }

    @Test
    void getClientById_ShouldReturnClient() throws Exception {
        ClientDTO client = new ClientDTO();
        client.setId(1L);
        when(clientService.getClientById(1L)).thenReturn(client);

        mockMvc.perform(get("/api/clients/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void blockClient_ShouldReturnOk() throws Exception {
        doNothing().when(clientService).blockClient(1L);

        mockMvc.perform(post("/api/clients/1/block"))
                .andExpect(status().isOk());
    }
}
