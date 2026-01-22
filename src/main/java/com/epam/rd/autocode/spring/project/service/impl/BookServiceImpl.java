package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.BookDTO;
import com.epam.rd.autocode.spring.project.mapper.BookMapper;
import com.epam.rd.autocode.spring.project.model.Book;
import com.epam.rd.autocode.spring.project.repo.BookRepository;
import com.epam.rd.autocode.spring.project.repo.specification.BookSpecification;
import com.epam.rd.autocode.spring.project.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;

    @Override
    public List<BookDTO> getAllBooks() {
        return bookRepository.findAll().stream()
                .map(bookMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<BookDTO> searchBooks(String keyword, String genre, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        Specification<Book> spec = Specification.where(BookSpecification.hasKeyword(keyword))
                .and(BookSpecification.hasGenre(genre))
                .and(BookSpecification.priceGreaterOrEqual(minPrice))
                .and(BookSpecification.priceLessOrEqual(maxPrice));

        return bookRepository.findAll(spec, pageable)
                .map(bookMapper::toDto);
    }

    @Override
    public BookDTO getBookByName(String name) {
        return bookRepository.findByName(name)
                .map(bookMapper::toDto)
                .orElseThrow(() -> new RuntimeException("Book not found with name: " + name));
    }

    @Override
    public Integer getBookQuantity(String name) {
        return bookRepository.findByName(name)
                .map(Book::getQuantity)
                .orElseThrow(() -> new RuntimeException("Book not found with name: " + name));
    }

    @Override
    @Transactional
    public BookDTO updateBookByName(String name, BookDTO bookDTO) {
        Book existingBook = bookRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Book not found with name: " + name));

        existingBook.setName(bookDTO.getName());
        existingBook.setGenre(bookDTO.getGenre());
        existingBook.setAgeGroup(bookDTO.getAgeGroup());
        existingBook.setPrice(bookDTO.getPrice());
        existingBook.setPublicationDate(bookDTO.getPublicationDate());
        existingBook.setAuthor(bookDTO.getAuthor());
        existingBook.setPages(bookDTO.getPages());
        existingBook.setCharacteristics(bookDTO.getCharacteristics());
        existingBook.setDescription(bookDTO.getDescription());
        existingBook.setLanguage(bookDTO.getLanguage());
        existingBook.setQuantity(bookDTO.getQuantity());

        return bookMapper.toDto(bookRepository.save(existingBook));
    }

    @Override
    @Transactional
    public void deleteBookByName(String name) {
        Book book = bookRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Book not found with name: " + name));
        bookRepository.delete(book);
    }

    @Override
    @Transactional
    public BookDTO addBook(BookDTO bookDTO) {
        if (bookRepository.findByName(bookDTO.getName()).isPresent()) {
            throw new RuntimeException("Book with name " + bookDTO.getName() + " already exists");
        }

        Book book = bookMapper.toEntity(bookDTO);
        if (book.getQuantity() == null) book.setQuantity(0);

        return bookMapper.toDto(bookRepository.save(book));
    }
    @Override
    public List<String> getAllGenres() {
        return bookRepository.findAllGenres();
    }
}