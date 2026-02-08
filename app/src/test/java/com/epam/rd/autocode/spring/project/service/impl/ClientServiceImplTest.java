package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.ClientDTO;
import com.epam.rd.autocode.spring.project.mapper.ClientMapper;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.repo.BookRepository;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.repo.FavoriteItemRepository;
import com.epam.rd.autocode.spring.project.repo.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceImplTest {

    @Mock
    private ClientRepository clientRepository;
    @Mock
    private BookRepository bookRepository;
    @Mock
    private FavoriteItemRepository favoriteItemRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ClientMapper clientMapper;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ClientServiceImpl clientService;

    private Client client;
    private ClientDTO clientDTO;

    @BeforeEach
    void setUp() {
        client = new Client();
        client.setId(1L);
        client.setEmail("test@example.com");
        client.setName("Test User");

        clientDTO = new ClientDTO();
        clientDTO.setEmail("test@example.com");
        clientDTO.setName("Test User");
        clientDTO.setPassword("password");
    }

    @Test
    void getAllClients_ShouldReturnPage() {
        Pageable pageable = Pageable.unpaged();
        when(clientRepository.findAll(pageable)).thenReturn(new PageImpl<>(Collections.singletonList(client)));
        when(clientMapper.toDto(client)).thenReturn(clientDTO);
        when(orderRepository.countOrdersByClientId(1L)).thenReturn(5);

        Page<ClientDTO> result = clientService.getAllClients(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(5, result.getContent().get(0).getTotalOrders());
    }

    @Test
    void getClientById_Found_ShouldReturnDto() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(clientMapper.toDto(client)).thenReturn(clientDTO);
        when(orderRepository.countOrdersByClientId(1L)).thenReturn(5);

        ClientDTO result = clientService.getClientById(1L);

        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
    }

    @Test
    void getClientById_NotFound_ShouldThrowException() {
        when(clientRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> clientService.getClientById(1L));
    }

    @Test
    void addClient_NewEmail_ShouldSave() {
        when(clientRepository.findByEmail(clientDTO.getEmail())).thenReturn(Optional.empty());
        when(clientMapper.toEntity(clientDTO)).thenReturn(client);
        when(passwordEncoder.encode(clientDTO.getPassword())).thenReturn("encoded");
        when(clientRepository.save(client)).thenReturn(client);
        when(clientMapper.toDto(client)).thenReturn(clientDTO);

        ClientDTO result = clientService.addClient(clientDTO);

        assertNotNull(result);
        verify(clientRepository).save(any());
        assertEquals("encoded", client.getPassword());
    }

    @Test
    void addClient_ExistingEmail_ShouldThrowException() {
        when(clientRepository.findByEmail(clientDTO.getEmail())).thenReturn(Optional.of(client));

        assertThrows(RuntimeException.class, () -> clientService.addClient(clientDTO));
    }

    @Test
    void searchClients_ShouldReturnPage() {
        Pageable pageable = Pageable.unpaged();
        when(clientRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class),
                any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.singletonList(client)));
        when(clientMapper.toDto(client)).thenReturn(clientDTO);
        when(orderRepository.countOrdersByClientId(1L)).thenReturn(0);

        Page<ClientDTO> result = clientService.searchClients("test", null, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void updateClientById_ShouldUpdateFields() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(clientRepository.save(any())).thenReturn(client);
        when(clientMapper.toDto(client)).thenReturn(clientDTO);

        clientDTO.setName("New Name");
        clientDTO.setPassword("newpass");
        when(passwordEncoder.encode("newpass")).thenReturn("encoded_new");

        ClientDTO result = clientService.updateClientById(1L, clientDTO);

        assertNotNull(result);
        assertEquals("New Name", client.getName());
        verify(passwordEncoder).encode("newpass");
    }

    @Test
    void unblockClient_ShouldSetBlockedFalse() {
        client.setBlocked(true);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));

        clientService.unblockClient(1L);

        assertFalse(client.isBlocked());
        verify(clientRepository).save(client);
    }
}
