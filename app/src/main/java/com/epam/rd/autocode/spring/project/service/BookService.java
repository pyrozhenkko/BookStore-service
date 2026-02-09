package com.epam.rd.autocode.spring.project.service;

import com.epam.rd.autocode.spring.project.dto.BookDTO;
import com.epam.rd.autocode.spring.project.model.enums.AgeGroup;
import com.epam.rd.autocode.spring.project.model.enums.Language;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;

import java.math.BigDecimal;
import java.util.List;

public interface BookService {

    @PreAuthorize("permitAll()")
    List<BookDTO> getAllBooks(String locale);

    @PreAuthorize("permitAll()")
    Page<BookDTO> searchBooks(String keyword, String genre, String stockStatus, BigDecimal minPrice,
            BigDecimal maxPrice,
            Language language, AgeGroup ageGroup,
            Pageable pageable, String locale);

    @PreAuthorize("permitAll()")
    BookDTO getBookByName(String name, String locale);

    @PreAuthorize("permitAll()")
    Integer getBookQuantity(String name);

    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    BookDTO updateBookByName(String name, BookDTO book, String locale);

    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    void deleteBookByName(String name);

    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    BookDTO addBook(BookDTO book);

    @PreAuthorize("permitAll()")
    List<String> getAllGenres(String locale);
}
