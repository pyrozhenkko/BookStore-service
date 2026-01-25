package com.epam.rd.autocode.spring.project.controller;

import com.epam.rd.autocode.spring.project.dto.BookDTO;
import com.epam.rd.autocode.spring.project.service.BookService;
import com.epam.rd.autocode.spring.project.service.impl.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final FileStorageService fileStorageService;


    // GET /api/books/search?keyword=Harry&minPrice=10&sort=price,asc&page=0&size=5
    @GetMapping("/search")
    public ResponseEntity<Page<BookDTO>> searchBooks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(sort = "id", direction = Sort.Direction.DESC, size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(bookService.searchBooks(keyword, genre, minPrice, maxPrice, pageable));
    }

    @GetMapping("/{name}")
    public ResponseEntity<BookDTO> getBookByName(@PathVariable String name) {
        return ResponseEntity.ok(bookService.getBookByName(name));
    }

    @GetMapping("/{name}/quantity")
    public ResponseEntity<Map<String, Integer>> getBookQuantity(@PathVariable String name) {
        Integer qty = bookService.getBookQuantity(name);
        return ResponseEntity.ok(Map.of("quantity", qty));
    }

    @PostMapping
    public ResponseEntity<BookDTO> addBook(@RequestBody BookDTO bookDTO) {
        return new ResponseEntity<>(bookService.addBook(bookDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{name}")
    public ResponseEntity<BookDTO> updateBook(@PathVariable String name, @RequestBody BookDTO bookDTO) {
        return ResponseEntity.ok(bookService.updateBookByName(name, bookDTO));
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<Void> deleteBook(@PathVariable String name) {
        bookService.deleteBookByName(name);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{name}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookDTO> uploadBookImage(
            @PathVariable String name,
            @RequestParam("file") MultipartFile file) {

        String imageUrl = fileStorageService.storeFile(file);
        BookDTO bookDTO = bookService.getBookByName(name);

        if (bookDTO.getImageUrls() == null) {
            bookDTO.setImageUrls(new ArrayList<>());
        }
        bookDTO.getImageUrls().add(imageUrl);

        BookDTO updatedBook = bookService.updateBookByName(name, bookDTO);
        return ResponseEntity.ok(updatedBook);
    }
    @GetMapping("/genres")
    public ResponseEntity<List<String>> getAllGenres() {
        return ResponseEntity.ok(bookService.getAllGenres());
    }
}