package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.ClientDTO;
import com.epam.rd.autocode.spring.project.dto.favorite.FavoriteDTOs.*;
import com.epam.rd.autocode.spring.project.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;


    @PostMapping("/favorites")
    public ResponseEntity<Void> addToFavorites(@RequestBody FavoriteRequest request) {
        clientService.addBookToFavorites(request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/favorites/{bookId}")
    public ResponseEntity<Void> removeFromFavorites(@PathVariable Long bookId) {
        clientService.removeBookFromFavorites(bookId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<FavoriteItemDTO>> getMyFavorites() {
        return ResponseEntity.ok(clientService.getMyFavorites());
    }


    @PostMapping
    public ResponseEntity<ClientDTO> registerClient(@RequestBody ClientDTO clientDTO) {
        return new ResponseEntity<>(clientService.addClient(clientDTO), HttpStatus.CREATED);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ClientDTO>> searchClients(
            @RequestParam(required = false) String keyword,
            @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(clientService.searchClients(keyword, pageable));
    }

    @GetMapping
    public ResponseEntity<Page<ClientDTO>> getAllClients(
            @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(clientService.getAllClients(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientDTO> getClientById(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.getClientById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientDTO> updateClient(@PathVariable Long id, @RequestBody ClientDTO clientDTO) {
        return ResponseEntity.ok(clientService.updateClientById(id, clientDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        clientService.deleteClientById(id);
        return ResponseEntity.noContent().build();
    }
}