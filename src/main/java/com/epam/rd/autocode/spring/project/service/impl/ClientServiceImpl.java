package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.ClientDTO;
import com.epam.rd.autocode.spring.project.mapper.ClientMapper;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<ClientDTO> getAllClients() {
        return clientRepository.findAll().stream()
                .map(clientMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ClientDTO getClientById(Long id) {
        return clientRepository.findById(id)
                .map(clientMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
    }

    @Override
    public ClientDTO getClientByEmail(String email) {
        return clientRepository.findByEmail(email)
                .map(clientMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Client not found with email: " + email));
    }

    @Override
    @Transactional
    public ClientDTO addClient(ClientDTO clientDTO) {
        // Перевірка на дублікат email
        if (clientRepository.findByEmail(clientDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Client with email " + clientDTO.getEmail() + " already exists");
        }

        Client client = clientMapper.toEntity(clientDTO);
        client.setPassword(passwordEncoder.encode(clientDTO.getPassword()));

        return clientMapper.toDto(clientRepository.save(client));
    }

    @Override
    @Transactional
    public ClientDTO updateClientById(Long id, ClientDTO clientDTO) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));

        client.setName(clientDTO.getName());
        client.setBalance(clientDTO.getBalance());

        if (clientDTO.getPassword() != null && !clientDTO.getPassword().isBlank()) {
            client.setPassword(passwordEncoder.encode(clientDTO.getPassword()));
        }

        return clientMapper.toDto(clientRepository.save(client));
    }

    @Override
    @Transactional
    public void deleteClientById(Long id) {
        if (!clientRepository.existsById(id)) {
            throw new RuntimeException("Client not found with id: " + id);
        }
        clientRepository.deleteById(id);
    }
}