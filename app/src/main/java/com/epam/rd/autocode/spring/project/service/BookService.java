package com.epam.rd.autocode.spring.project.service;

import com.epam.rd.autocode.spring.project.dto.BookDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;

import java.math.BigDecimal;
import java.util.List;

public interface BookService {

    @PreAuthorize("permitAll()")
    List<BookDTO> getAllBooks(String locale);

    @PreAuthorize("permitAll()")
    Page<BookDTO> searchBooks(String keyword, String genre, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable,
            String locale);


    @PreAuthorize("permitAll()")
    BookDTO getBookByName(String name, String locale);

    @PreAuthorize("permitAll()")
    Integer getBookQuantity(String name);

    @PreAuthorize("hasRole('EMPLOYEE')")
    BookDTO updateBookByName(String name, BookDTO book);

    @PreAuthorize("hasRole('EMPLOYEE')")
    void deleteBookByName(String name);

    @PreAuthorize("hasRole('EMPLOYEE')")
    BookDTO addBook(BookDTO book);

    @PreAuthorize("permitAll()")
    List<String> getAllGenres(String locale);
}
