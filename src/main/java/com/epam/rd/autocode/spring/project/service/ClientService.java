package com.epam.rd.autocode.spring.project.service;

import com.epam.rd.autocode.spring.project.dto.ClientDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;

public interface ClientService {

    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    Page<ClientDTO> getAllClients(Pageable pageable);

    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    Page<ClientDTO> searchClients(String keyword, Pageable pageable);

    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE') or @customSecurity.isClientOwner(#id)")
    ClientDTO getClientById(Long id);

    ClientDTO getClientByEmail(String email);

    @PreAuthorize("permitAll()")
    ClientDTO addClient(ClientDTO client);

    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE') or @customSecurity.isClientOwner(#id)")
    ClientDTO updateClientById(Long id, ClientDTO client);

    @PreAuthorize("hasRole('ADMIN') or @customSecurity.isClientOwner(#id)")
    void deleteClientById(Long id);
}