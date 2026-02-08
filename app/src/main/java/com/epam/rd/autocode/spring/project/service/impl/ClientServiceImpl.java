package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.ClientDTO;
import com.epam.rd.autocode.spring.project.dto.favorite.FavoriteDTOs.*;
import com.epam.rd.autocode.spring.project.mapper.BookMapper;
import com.epam.rd.autocode.spring.project.exception.AlreadyExistException;
import com.epam.rd.autocode.spring.project.exception.NotFoundException;
import com.epam.rd.autocode.spring.project.mapper.ClientMapper;
import com.epam.rd.autocode.spring.project.model.Book;
import com.epam.rd.autocode.spring.project.model.Client;
import com.epam.rd.autocode.spring.project.model.FavoriteItem;
import com.epam.rd.autocode.spring.project.repo.BookRepository;
import com.epam.rd.autocode.spring.project.repo.ClientRepository;
import com.epam.rd.autocode.spring.project.repo.FavoriteItemRepository;
import com.epam.rd.autocode.spring.project.repo.specification.ClientSpecification;
import com.epam.rd.autocode.spring.project.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final BookRepository bookRepository;
    private final FavoriteItemRepository favoriteItemRepository;
    private final com.epam.rd.autocode.spring.project.repo.OrderRepository orderRepository;
    private final ClientMapper clientMapper;
    private final BookMapper bookMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<ClientDTO> getAllClients(Pageable pageable) {
        return clientRepository.findAll(pageable).map(this::toDtoWithCount);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClientDTO> searchClients(String keyword, Boolean isBlocked, Pageable pageable) {
        Specification<Client> spec = Specification.where(ClientSpecification.hasKeyword(keyword))
                .and(ClientSpecification.isBlocked(isBlocked));
        return clientRepository.findAll(spec, pageable).map(this::toDtoWithCount);
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDTO getClientById(Long id) {
        return clientRepository.findById(id).map(this::toDtoWithCount)
                .orElseThrow(() -> new NotFoundException("Client not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDTO getClientByEmail(String email) {
        return clientRepository.findByEmail(email).map(this::toDtoWithCount)
                .orElseThrow(() -> new NotFoundException("Client not found"));
    }

    @Override
    @Transactional
    public ClientDTO addClient(ClientDTO clientDTO) {
        if (clientRepository.findByEmail(clientDTO.getEmail()).isPresent()) {
            throw new AlreadyExistException("Client with this email already exists");
        }
        Client client = clientMapper.toEntity(clientDTO);
        client.setPassword(passwordEncoder.encode(clientDTO.getPassword()));
        return this.toDtoWithCount(clientRepository.save(client));
    }

    @Override
    @Transactional
    public ClientDTO updateClientById(Long id, ClientDTO clientDTO) {
        Client client = clientRepository.findById(id).orElseThrow(() -> new NotFoundException("Client not found"));
        client.setName(clientDTO.getName());

        if (clientDTO.getEmail() != null && !clientDTO.getEmail().equals(client.getEmail())) {
            if (clientRepository.findByEmail(clientDTO.getEmail()).isPresent()) {
                throw new AlreadyExistException("Email already exists");
            }
            client.setEmail(clientDTO.getEmail());
        }

        if (clientDTO.getPassword() != null && !clientDTO.getPassword().isBlank()) {
            client.setPassword(passwordEncoder.encode(clientDTO.getPassword()));
        }
        return this.toDtoWithCount(clientRepository.save(client));
    }

    private ClientDTO toDtoWithCount(Client client) {
        ClientDTO dto = clientMapper.toDto(client);
        dto.setTotalOrders(orderRepository.countOrdersByClientId(client.getId()));
        return dto;
    }

    @Override
    @Transactional
    public void deleteClientById(Long id) {
        clientRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void addBookToFavorites(FavoriteRequest request) {
        Client client = getCurrentClient();

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new NotFoundException("Book not found"));

        Optional<FavoriteItem> existing = favoriteItemRepository.findByClient_EmailAndBook_Id(client.getEmail(),
                request.getBookId());

        if (existing.isPresent()) {
            // Якщо є - оновлюємо примітку
            existing.get().setNote(request.getNote());
            favoriteItemRepository.save(existing.get());
        } else {
            FavoriteItem newItem = new FavoriteItem(client, book, request.getNote());
            client.getFavorites().add(newItem);
            clientRepository.save(client);
        }
    }

    @Override
    @Transactional
    public void removeBookFromFavorites(Long bookId) {
        Client client = getCurrentClient();

        FavoriteItem itemToRemove = favoriteItemRepository.findByClient_EmailAndBook_Id(client.getEmail(), bookId)
                .orElseThrow(() -> new NotFoundException("Book not in favorites"));

        client.getFavorites().remove(itemToRemove);
        favoriteItemRepository.delete(itemToRemove);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FavoriteItemDTO> getMyFavorites() {
        Client client = getCurrentClient();

        return client.getFavorites().stream()
                .map(item -> new FavoriteItemDTO(
                        item.getId(),
                        bookMapper.toDto(item.getBook()),
                        item.getNote(),
                        item.getAddedAt()))
                .collect(Collectors.toList());
    }

    private Client getCurrentClient() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return clientRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Current user not found"));
    }

    @Override
    @Transactional
    public void blockClient(Long id) {
        Client client = clientRepository.findById(id).orElseThrow(() -> new NotFoundException("Client not found"));
        client.setBlocked(true);
        clientRepository.save(client);
    }

    @Override
    @Transactional
    public void unblockClient(Long id) {
        Client client = clientRepository.findById(id).orElseThrow(() -> new NotFoundException("Client not found"));
        client.setBlocked(false);
        clientRepository.save(client);
    }
}