package com.epam.rd.autocode.spring.project.service;

import com.epam.rd.autocode.spring.project.dto.ClientDTO;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

public interface ClientService {


    @PreAuthorize("hasRole('EMPLOYEE')")
    List<ClientDTO> getAllClients();

    @PreAuthorize("hasRole('EMPLOYEE') or @customSecurity.isClientOwner(#id)")
    ClientDTO getClientById(Long id);


    ClientDTO getClientByEmail(String email);


    @PreAuthorize("permitAll()")
    ClientDTO addClient(ClientDTO client);

    @PreAuthorize("hasRole('EMPLOYEE') or @customSecurity.isClientOwner(#id)")
    ClientDTO updateClientById(Long id, ClientDTO client);

    @PreAuthorize("hasRole('EMPLOYEE') or @customSecurity.isClientOwner(#id)")
    void deleteClientById(Long id);
}