package com.epam.rd.autocode.spring.project.service.impl;

import com.epam.rd.autocode.spring.project.dto.BookDTO;
import com.epam.rd.autocode.spring.project.exception.NotFoundException;
import com.epam.rd.autocode.spring.project.mapper.BookMapper;
import com.epam.rd.autocode.spring.project.model.Book;
import com.epam.rd.autocode.spring.project.model.BookTranslation;
import com.epam.rd.autocode.spring.project.model.enums.AgeGroup;
import com.epam.rd.autocode.spring.project.model.enums.Language;
import com.epam.rd.autocode.spring.project.repo.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookServiceImplTest {

    @Mock
    private BookRepository bookRepository;
    @Mock
    private BookMapper bookMapper;
    @Mock
    private GoogleBooksService googleBooksService;
    @Mock
    private FileStorageService fileStorageService;
    @Mock
    private BookTranslationRepository bookTranslationRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private FavoriteItemRepository favoriteItemRepository;
    @Mock
    private BookRatingRepository bookRatingRepository;
    @Mock
    private BookCommentRepository bookCommentRepository;
    @Mock
    private BookItemRepository bookItemRepository;

    @InjectMocks
    private BookServiceImpl bookService;

    private Book book;
    private BookDTO bookDTO;

    @BeforeEach
    void setUp() {
        book = new Book();
        book.setId(1L);
        book.setName("Test Book");
        book.setGenre("Fantasy");
        book.setPrice(BigDecimal.valueOf(100));
        book.setQuantity(10);
        book.setImageUrls(new ArrayList<>());
        book.setLanguage(Language.ENGLISH);
        book.setAgeGroup(AgeGroup.ADULT);
        book.setPublicationDate(LocalDate.now());

        bookDTO = new BookDTO();
        bookDTO.setName("Test Book");
        bookDTO.setGenre("Fantasy");
        bookDTO.setPrice(BigDecimal.valueOf(100));
        bookDTO.setQuantity(10);
        bookDTO.setImageUrls(new ArrayList<>());
    }

    @Test
    void getAllBooks_DefaultLocale_ShouldReturnBooks() {
        when(bookRepository.findAll()).thenReturn(List.of(book));
        when(bookMapper.toDto(book)).thenReturn(bookDTO);

        List<BookDTO> result = bookService.getAllBooks("en");

        assertEquals(1, result.size());
        assertEquals("Test Book", result.get(0).getName());
        verify(bookTranslationRepository, never()).findByBookIdAndLocale(anyLong(), anyString());
    }

    @Test
    void getAllBooks_OtherLocale_ShouldApplyTranslation() {
        String locale = "uk";
        BookTranslation translation = new BookTranslation();
        translation.setName("Тестова Книга");
        translation.setGenre("Фентезі");

        when(bookRepository.findAll()).thenReturn(List.of(book));
        when(bookMapper.toDto(book)).thenReturn(bookDTO);
        when(bookTranslationRepository.findByBookIdAndLocale(1L, locale)).thenReturn(Optional.of(translation));

        List<BookDTO> result = bookService.getAllBooks(locale);

        assertEquals(1, result.size());
        assertEquals("Тестова Книга", result.get(0).getName());
        assertEquals("Фентезі", result.get(0).getGenre());
    }

    @Test
    void getBookByName_FoundInRepo_ShouldReturnBook() {
        when(bookRepository.findByName("Test Book")).thenReturn(Optional.of(book));
        when(bookMapper.toDto(book)).thenReturn(bookDTO);
        when(googleBooksService.findImagesByTitle(any())).thenReturn(Collections.emptyList());

        BookDTO result = bookService.getBookByName("Test Book", "en");

        assertNotNull(result);
        assertEquals("Test Book", result.getName());
    }

    @Test
    void getBookByName_FoundInTranslations_ShouldReturnBook() {
        String ukName = "Тестова Книга";
        BookTranslation translation = new BookTranslation();
        translation.setBook(book);
        translation.setName(ukName);

        when(bookRepository.findByName(ukName)).thenReturn(Optional.empty());
        when(bookTranslationRepository.findByName(ukName)).thenReturn(Optional.of(translation));
        when(bookMapper.toDto(book)).thenReturn(bookDTO);
        when(googleBooksService.findImagesByTitle(any())).thenReturn(Collections.emptyList());

        BookDTO result = bookService.getBookByName(ukName, "en");

        assertNotNull(result);
        verify(bookTranslationRepository).findByName(ukName);
    }

    @Test
    void getBookByName_NotFound_ShouldThrowException() {
        when(bookRepository.findByName("Unknown")).thenReturn(Optional.empty());
        when(bookTranslationRepository.findByName("Unknown")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> bookService.getBookByName("Unknown", "en"));
    }

    @Test
    void addBook_NewBook_ShouldSave() {
        when(bookRepository.findByName(bookDTO.getName())).thenReturn(Optional.empty());
        when(bookMapper.toEntity(bookDTO)).thenReturn(book);
        when(bookRepository.save(book)).thenReturn(book);
        when(bookMapper.toDto(book)).thenReturn(bookDTO);

        BookDTO result = bookService.addBook(bookDTO);

        assertNotNull(result);
        verify(bookRepository).save(book);
        verify(googleBooksService).findImagesByTitle(book.getName());
    }

    @Test
    void addBook_ExistingBook_ShouldThrowException() {
        when(bookRepository.findByName(bookDTO.getName())).thenReturn(Optional.of(book));

        assertThrows(RuntimeException.class, () -> bookService.addBook(bookDTO));
        verify(bookRepository, never()).save(any());
    }

    @Test
    void deleteBookByName_NotPurchased_ShouldDeleteAllDependencies() {
        when(bookRepository.findByName("Test Book")).thenReturn(Optional.of(book));
        when(bookItemRepository.existsByBookId(book.getId())).thenReturn(false);
        book.getImageUrls().add("/uploads/img.jpg");

        bookService.deleteBookByName("Test Book");

        verify(fileStorageService).deleteFile("/uploads/img.jpg");
        verify(cartItemRepository).deleteByBookId(book.getId());
        verify(favoriteItemRepository).deleteByBookId(book.getId());
        verify(bookRepository).delete(book);
    }

    @Test
    void deleteBookByName_Purchased_ShouldThrowException() {
        when(bookRepository.findByName("Test Book")).thenReturn(Optional.of(book));
        when(bookItemRepository.existsByBookId(book.getId())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> bookService.deleteBookByName("Test Book"));

        assertTrue(exception.getMessage().contains("purchased"));
        verify(bookRepository, never()).delete(any(Book.class));
    }

    @Test
    void updateBookByName_DefaultLocale_ShouldUpdateMainEntity() {
        when(bookRepository.findByName("Test Book")).thenReturn(Optional.of(book));
        when(bookRepository.save(book)).thenReturn(book);
        when(bookMapper.toDto(book)).thenReturn(bookDTO);

        bookDTO.setPrice(BigDecimal.valueOf(200));
        bookDTO.setGenre("New Genre");

        bookService.updateBookByName("Test Book", bookDTO, "en");

        assertEquals(BigDecimal.valueOf(200), book.getPrice());
        assertEquals("New Genre", book.getGenre());
        verify(bookTranslationRepository, never()).save(any());
    }

    @Test
    void updateBookByName_OtherLocale_ShouldUpdateTranslation() {
        String locale = "uk";
        when(bookRepository.findByName("Test Book")).thenReturn(Optional.of(book));
        when(bookRepository.save(book)).thenReturn(book);
        when(bookMapper.toDto(book)).thenReturn(bookDTO);
        when(bookTranslationRepository.findByBookAndLocale(book, locale)).thenReturn(Optional.empty());

        bookDTO.setName("Тест");

        bookService.updateBookByName("Test Book", bookDTO, locale);

        verify(bookTranslationRepository)
                .save(argThat(t -> t.getLocale().equals(locale) && t.getName().equals("Тест")));
    }

    @Test
    void searchBooks_ShouldReturnPage() {
        Pageable pageable = Pageable.unpaged();
        @SuppressWarnings("unchecked")
        Specification<Book> spec = any(Specification.class);
        when(bookRepository.findAll(spec, eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(book)));
        when(bookMapper.toDto(book)).thenReturn(bookDTO);

        Page<BookDTO> result = bookService.searchBooks("query", null, null, null, null, null, null, pageable, "en");

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void addImageToBook_ShouldAddToCollection() {
        when(bookRepository.findByName("Test Book")).thenReturn(Optional.of(book));
        when(bookRepository.save(book)).thenReturn(book);
        when(bookMapper.toDto(book)).thenReturn(bookDTO);

        bookService.addImageToBook("Test Book", "img.jpg");

        assertFalse(book.getImageUrls().isEmpty());
        assertEquals("img.jpg", book.getImageUrls().get(0));
    }
}
