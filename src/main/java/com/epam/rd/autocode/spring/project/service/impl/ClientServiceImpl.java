package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.ClientDTO;
import com.epam.rd.autocode.spring.project.mapper.ClientMapper;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.repo.specification.ClientSpecification;
import com.epam.rd.autocode.spring.project.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Page<ClientDTO> getAllClients(Pageable pageable) {
        return clientRepository.findAll(pageable).map(clientMapper::toDto);
    }

    // --- РЕАЛІЗАЦІЯ ПОШУКУ ---
    @Override
    public Page<ClientDTO> searchClients(String keyword, Pageable pageable) {
        Specification<Client> spec = ClientSpecification.hasKeyword(keyword);
        return clientRepository.findAll(spec, pageable).map(clientMapper::toDto);
    }

    @Override
    public ClientDTO getClientById(Long id) {
        return clientRepository.findById(id).map(clientMapper::toDto).orElseThrow(() -> new RuntimeException("Client not found"));
    }

    @Override
    public ClientDTO getClientByEmail(String email) {
        return clientRepository.findByEmail(email).map(clientMapper::toDto).orElseThrow(() -> new RuntimeException("Client not found"));
    }

    @Override
    @Transactional
    public ClientDTO addClient(ClientDTO clientDTO) {
        if (clientRepository.findByEmail(clientDTO.getEmail()).isPresent()) throw new RuntimeException("Exists");
        Client client = clientMapper.toEntity(clientDTO);
        client.setPassword(passwordEncoder.encode(clientDTO.getPassword()));
        return clientMapper.toDto(clientRepository.save(client));
    }

    @Override
    @Transactional
    public ClientDTO updateClientById(Long id, ClientDTO clientDTO) {
        Client client = clientRepository.findById(id).orElseThrow();
        client.setName(clientDTO.getName());
        // client.setBalance(...) - якщо є поле
        if (clientDTO.getPassword() != null && !clientDTO.getPassword().isBlank()) {
            client.setPassword(passwordEncoder.encode(clientDTO.getPassword()));
        }
        return clientMapper.toDto(clientRepository.save(client));
    }

    @Override
    @Transactional
    public void deleteClientById(Long id) {
        clientRepository.deleteById(id);
    }
}