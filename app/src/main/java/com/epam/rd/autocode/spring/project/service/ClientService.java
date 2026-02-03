package com.epam.rd.autocode.spring.project.service;

import com.epam.rd.autocode.spring.project.dto.ClientDTO;
import com.epam.rd.autocode.spring.project.dto.favorite.FavoriteDTOs.*; // Імпорт DTO
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

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

    @PreAuthorize("hasRole('CUSTOMER')")
    void addBookToFavorites(FavoriteRequest request);

    @PreAuthorize("hasRole('CUSTOMER')")
    void removeBookFromFavorites(Long bookId);

    @PreAuthorize("hasRole('CUSTOMER')")
    List<FavoriteItemDTO> getMyFavorites();
}