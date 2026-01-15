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
    public ClientDTO getClientByEmail(String email) {
        return clientRepository.findByEmail(email)
                .map(clientMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Client not found with email: " + email));
    }

    @Override
    @Transactional
    public ClientDTO updateClientByEmail(String email, ClientDTO clientDTO) {
        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Client not found with email: " + email));

        client.setName(clientDTO.getName());
        client.setBalance(clientDTO.getBalance());

        if (clientDTO.getPassword() != null && !clientDTO.getPassword().isBlank()) {
            client.setPassword(passwordEncoder.encode(clientDTO.getPassword()));
        }

        return clientMapper.toDto(clientRepository.save(client));
    }

    @Override
    @Transactional
    public void deleteClientByEmail(String email) {
        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Client not found with email: " + email));
        clientRepository.delete(client);
    }

    @Override
    @Transactional
    public ClientDTO addClient(ClientDTO clientDTO) {
        if (clientRepository.findByEmail(clientDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Client with email " + clientDTO.getEmail() + " already exists");
        }

        Client client = clientMapper.toEntity(clientDTO);
        client.setPassword(passwordEncoder.encode(clientDTO.getPassword()));
        return clientMapper.toDto(clientRepository.save(client));
    }
}