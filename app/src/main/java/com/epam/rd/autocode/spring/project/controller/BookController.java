package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.BookDTO;
import com.epam.rd.autocode.spring.project.service.impl.BookServiceImpl;
import com.epam.rd.autocode.spring.project.service.impl.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookServiceImpl bookService;
    private final FileStorageService fileStorageService;

    @GetMapping("/search")
    public ResponseEntity<Page<BookDTO>> searchBooks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(sort = "id", direction = Sort.Direction.DESC, size = 10) Pageable pageable,
            @RequestHeader(value = "Accept-Language", defaultValue = "uk") String locale) {
        return ResponseEntity.ok(bookService.searchBooks(keyword, genre, minPrice, maxPrice, pageable, locale));
    }

    @GetMapping
    public ResponseEntity<List<BookDTO>> getAllBooks(
            @RequestHeader(value = "Accept-Language", defaultValue = "uk") String locale) {
        return ResponseEntity.ok(bookService.getAllBooks(locale));
    }

    @GetMapping("/{name}")
    public ResponseEntity<BookDTO> getBookByName(
            @PathVariable String name,
            @RequestHeader(value = "Accept-Language", defaultValue = "uk") String locale) {
        return ResponseEntity.ok(bookService.getBookByName(name, locale));
    }

    @GetMapping("/{name}/quantity")
    public ResponseEntity<Map<String, Integer>> getBookQuantity(@PathVariable String name) {
        Integer qty = bookService.getBookQuantity(name);
        return ResponseEntity.ok(Map.of("quantity", qty));
    }

    @GetMapping("/genres")
    public ResponseEntity<List<String>> getAllGenres(
            @RequestHeader(value = "Accept-Language", defaultValue = "uk") String locale) {
        return ResponseEntity.ok(bookService.getAllGenres(locale));
    }

    @PostMapping(value = "/{name}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<BookDTO> uploadBookImage(
            @PathVariable String name,
            @RequestParam("file") MultipartFile file) {

        String imageUrl = fileStorageService.storeFile(file);

        return ResponseEntity.ok(bookService.addImageToBook(name, imageUrl));
    }

    @DeleteMapping("/{name}/images")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<BookDTO> deleteBookImage(
            @PathVariable String name,
            @RequestParam("imageUrl") String imageUrl) {

        return ResponseEntity.ok(bookService.removeImageFromBook(name, imageUrl));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<BookDTO> addBook(@RequestBody BookDTO bookDTO) {
        return new ResponseEntity<>(bookService.addBook(bookDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{name}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<BookDTO> updateBook(@PathVariable String name, @RequestBody BookDTO bookDTO) {
        return ResponseEntity.ok(bookService.updateBookByName(name, bookDTO));
    }

    @DeleteMapping("/{name}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Void> deleteBook(@PathVariable String name) {
        bookService.deleteBookByName(name);
        return ResponseEntity.noContent().build();
    }
}
